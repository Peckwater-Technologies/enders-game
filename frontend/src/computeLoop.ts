import {
	jsonToModel,
	modelToJson
} from "./shared/tfSerialize"
import {
	gameLoop
} from "./shared/gameLoop";
import {
	ShooterGame
} from "./shared/shooter_imp";
import {
	MappedNeuralNetBot
} from "./shared/neuralnet_bot";
import { StampedeBot, RealPlayer } from "./shared/dumb_bot";
import { GameState, Renderer } from "./shared/interfaces";

const baseURL = 'http://3.10.151.21';

export async function getNetModel() {
	const res = await fetch(baseURL + "/models/shooter")
	const text = await res.text()
	const model = await jsonToModel(text)

	return model;
}

export async function doEvent(
	player1: StampedeBot | RealPlayer,
	renderer: Renderer<GameState>,
	fps: number,
	exitOnDone: boolean
) {
	const model = await getNetModel();
	return new Promise < void > (resolve => {
		console.log('Running simulation' + (player1.constructor.name !== 'StampedeBot' ? ': Human' : ''));
		gameLoop(
			ShooterGame,
			[player1, MappedNeuralNetBot(model, ShooterGame)], renderer,
			fps,
			exitOnDone,
			({
				totalReward,
				steps
			}) => {
				let performance = totalReward / steps;
				console.log(totalReward, performance, steps);
				modelToJson(model, performance).then(json => {
					fetch(baseURL + "/models/shooter", {
						method: 'POST',
						body: json,
						headers: {
							'Content-Type': 'application/json'
						}
					}).then(() => {
						resolve()
						console.log("Completed simulation")
					})
				});
			}
		)
	});
}

export async function computeLoop() {
	while (true) await Promise.race([doEvent(new StampedeBot(), {
		render: () => {},
		redeploy: () => {}
	}, 100, true), delay(30000)]);
	let all = [];
	for (let i = 0; i < 200; i++) {
		all.push(doEvent(new StampedeBot(), {
			render: () => {},
			redeploy: () => {}
		}, 100, true));
	}
	Promise.all(all);
}

function delay(ms: number): Promise<null> {
	return new Promise((res, rej) => {
		setTimeout(res, ms)
	})
}