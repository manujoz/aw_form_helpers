import { PolymerElement, html } from "/node_modules/aw_polymer_3/polymer/polymer-element.js";

class AwCharCounter extends PolymerElement {
	static get template() {
		return html`
		<style>
            :host {
                position: var(--aw-countchar-counter-position,relative);
                top: var(--aw-countchar-counter-top,auto);
                right: var(--aw-countchar-counter-right,auto);
                bottom: var(--aw-countchar-counter-bottom,auto);
                right: var(--aw-countchar-counter-right,auto);
                padding: var(--aw-countchar-counter-padding,0);
                margin: var(--aw-countchar-counter-margin,0);
                color: var(--aw-countchar-color,var(--aw-primary-color,var(--aw-input-label-color,#888888)));
                font-family: var(--aw-countchar-font-family,var(--aw-input-font-family,"arial"));
                font-weight: var(--aw-countchar-font-weight,var(--aw-input-font-weight, normal));
                font-size: var(--aw-countchar-font-size,12px);
				text-align: var(--aw-countchar-text-align,right);
                transition: all .2s;
                display: block;
                z-index: 2;
            }
            :host([focused]) {
                color: var(--aw-countchar-color-focused,var(--aw-input-label-color-focused,var(--aw-primary-color,#1C7CDD)));
            }
            :host([error]) {
                color: var(--aw-countchar-error-color,var(--aw-input-error-color,var(--aw-error-color,#b13033)));
            }
        </style>
        <slot></slot>
		`;
    }
    
    connectedCallback() {
        super.connectedCallback();
        this.removeAttribute( "unresolved" );
    }
}

window.customElements.define( "aw-char-counter", AwCharCounter );