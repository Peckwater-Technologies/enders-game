import {Agent} from "./interfaces";
import {ShooterObservation, ShooterAction} from "./shooter_interfaces";

export class DumbAgent implements Agent < ShooterObservation, ShooterAction > {
	act(state: ShooterObservation): ShooterAction {
		return {
			fireBullet: true,
			turnLeft: true,
			turnRight: false,
			moveForward: true,
		};
	}
}