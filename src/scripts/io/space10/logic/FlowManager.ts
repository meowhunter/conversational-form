/// <reference path="../form-tags/Tag.ts"/>
/// <reference path="../Space10CUI.ts"/>

namespace io.space10 {
	// interface
	export interface FlowManagerOptions{
		cuiReference: Space10CUI;
		tags: Array<ITag>;
	}

	export const FlowEvents = {
		USER_INPUT_UPDATE: "cui-flow-user-input-update",
		USER_INPUT_INVALID: "cui-flow-user-input-invalid",
		FLOW_UPDATE: "cui-flow-update",
	}

	// class
	export class FlowManager {
		private static STEP_TIME: number = 1000;

		private cuiReference: Space10CUI;
		private tags: Array<ITag>;

		private maxSteps: number = 0;
		private step: number = 0;
		private stepTimer: number = 0;
		private userInputUpdateCallback: () => void;

		public get currentTag(): io.space10.ITag | io.space10.ITagGroup {
			return this.tags[this.step];
		}

		constructor(options: FlowManagerOptions){
			this.cuiReference = options.cuiReference;
			this.tags = options.tags;

			this.maxSteps = this.tags.length;

			this.userInputUpdateCallback = this.userInputUpdate.bind(this);
			document.addEventListener(io.space10.InputEvents.UPDATE, this.userInputUpdateCallback, false);
		}

		public userInputUpdate(event: CustomEvent){
			// TODO: Handle flow things??
			if(this.currentTag.setTagValueAndIsValid(event.detail)){
				document.dispatchEvent(new CustomEvent(io.space10.FlowEvents.USER_INPUT_UPDATE, {
					detail: event.detail //input value
				}));

				// TODO: remove...
				setTimeout(() => this.nextStep(), 1500);
			}else{
				console.warn("Value not valid!!!", event.detail);
				document.dispatchEvent(new CustomEvent(io.space10.FlowEvents.USER_INPUT_INVALID, {
					detail: event.detail //input value
				}));
			}


		}

		public start(){
			//TODO: Add intro screen?
			this.validateStepAndUpdate();
		}

		public nextStep(){
			this.step++;
			this.validateStepAndUpdate();
		}

		public previousStep(){
			this.step--;
			this.validateStepAndUpdate();
		}

		public addStep(){
			// this can be used for when a Tags value is updated and new tags are presented,
			// TODO: fix this
		}

		public remove(){
			document.removeEventListener(io.space10.InputEvents.UPDATE, this.userInputUpdateCallback, false);
			this.userInputUpdateCallback = null;
		}

		private validateStepAndUpdate(){
			if(this.step == this.maxSteps - 1){
				console.warn("We are at the end..., submit click")
			}else{
				this.step %= this.maxSteps;
				this.showStep();
			}
		}

		private showStep(){
			document.dispatchEvent(new CustomEvent(io.space10.FlowEvents.FLOW_UPDATE, {
				detail: this.currentTag
			}));
		}
	}
}