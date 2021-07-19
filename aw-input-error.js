import { PolymerElement, html } from "../aw_polymer_3/polymer/polymer-element.js";

class AwInputError extends PolymerElement {
	static get template() {
		return html`
		<style>
            :host {
                position: var(--aw-helper-input-error-position,relative);
                top: var(--aw-helper-input-error-top,auto);
                right: var(--aw-helper-input-error-right,auto);
                bottom: var(--aw-helper-input-error-bottom,auto);
                left: var(--aw-helper-input-error-left,auto);
                padding: var(--aw-helper-input-error-padding,0);
                margin: var(--aw-helper-input-error-margin,0);
                color: var(--aw-input-error-color, #b13033);
                font-family: var(--aw-input-error-font-family,var(--aw-input-font-family, "arial"));
                font-weight: var(--aw-input-error-font-weight,var(--aw-input-font-weight, normal));
                font-size: var(--aw-input-error-font-size,11px);
                white-space: var(--aw-input-error-white-space,nowrap);
                display: block;
                transition: all .3s;
                z-index: 2;
            }
        </style>
        <slot></slot>
		`;
	}
}

window.customElements.define( "aw-input-error", AwInputError );