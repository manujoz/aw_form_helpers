import { PolymerElement, html } 		from "/node_modules/aw_polymer_3/polymer/polymer-element.js";

import "/node_modules/aw_polymer_3/iron-icons/iron-icons.js";

class AwInputDatalist extends PolymerElement {
	static get template() {
		return html`
		<style>
            :host {
                position: absolute;
				left: 0px;
				top: calc(100% - 1px);
                width: 100%;
                display: block;
                z-index: 10;
            }

            /* Datalist */

			.cont_options {
				position: absolute;
				top: 0px;
				left: 0px;
				width: 100%;
				height: 100%;
			}

            #datalist {
				position: fixed;
				color: var(--aw-input-datalist-color,var(--aw-input-color, #333333));
                background-color: var(--aw-input-datalist-background-color, white);
                box-shadow: var(--aw-input-datalist-box-shadow,0px 1px 3px #777777);
				overflow-x: auto;
				max-height: 300px;
				transition: height .2s;
				display: none;
				z-index: 10000;
            }
            #datalist::-webkit-scrollbar {
                width: 7px;
                background-color: #f0f0f0;
            }
            #datalist::-webkit-scrollbar-track {
                background-color: #f0f0f0;
            }
            #datalist::-webkit-scrollbar-thumb {
                background-color: #bbbbbb;
            }
            #datalist::-webkit-scrollbar-thumb:hover {
                background-color: #999999;
            }

            .option {
                position: relative;
                font-family: var(--aw-input-datalist-option-font-family,var(--aw-input-font-family,"arial"));
                font-size: var(--aw-input-datalist-option-font-size,14px);
                padding: var(--aw-input-datalist-option-padding,13px 10px);
                cursor: pointer;
                transition: background .2s;
            }
            .option > span {
                position: absolute;
                top: 0;
				right: 0;
				height: 100%;
				padding: 0 5px;
                font-size: var(--aw-input-datalist-value-font-size,11px);
                color: var(--aw-input-datalist-value-color,#777777);
                background-color: var(--aw-input-datalist-value-background-color,white);
				transition: background .2s;
				display: flex;
				flex-flow: row wrap;
				align-items: center;
			}
			
            .option:hover, .option:hover > span {
                color: var(--aw-input-datalist-color-hover, #3A9AE0);
                background-color: var(--aw-input-datalist-background-color-hover, #f6f6f6);
            }
            .option[selected], .option[selected] > span {
                color: var(--aw-input-datalist-color-hover, #3A9AE0);
                background-color: var(--aw-input-datalist-background-color-hover, #f6f6f6);
            }

            .arr-datalist {
                position: absolute;
                top: var(--aw-input-datalist-arrow-top,-27px);
                right: 0px;
                background-color: var(--aw-input-datalist-arrow-background-color, transparent);
                cursor: pointer;
                transition: all .2s;
            }
            .arr-datalist:hover {
                background-color: var(--aw-input-datalist-arrow-background-color-hover, transparent);
            }
            .iron-icon {
                fill: var(--aw-input-datalist-arrow-color, #999999);
                transition: all .2s;
            }
            .arr-datalist:hover .iron-icon {
                fill: var(--aw-input-datalist-arrow-color-hover,var(--aw-primary-color, #1C7CDD));
            }
            .hidden {
                display: none;
			}
		</style>
		<div class="cont_options">
			<div id="datalist">
				<template is="dom-repeat" items="{{options}}" filter="{{_filtering(string)}}" as="option">
					<div class="option" on-click="_select_option" value$="{{option.value}}">
						{{option.inner}}<span>{{option.valueShow}}</span>
					</div>
				</template>
			</div>
		</div>
        <div class="arr-datalist" on-click="_open">
            <iron-icon class="iron-icon" icon="{{icon}}"></iron-icon>
        </div>
		`;
	}

	static get properties() {
		return {
			input: { type: Object, value: {} },
			datalist: { type: Object, observer: "_create" },
			options: { type: Array, value() { return [] } },
			string: { type: String },
			selected: { type: Object, observer: "_selected_changed" },
			dlshwovalue: { type: Boolean, value: false },
			dlvisible: { type: Boolean, value: false, notify: true },
			icon: { type: String, value: "expand-more" },

			scrolltop: { type: Number },
			height: { type: Number },
			width: { type: Number }
		}
	}

	/**
	 * @method	constructor
	 * 
	 * Realiza las tareas necesarias al construir la clase.
	 */
	constructor() {
		super();

		this.functions = {
			keyup: ( ev ) => this._keyup( ev ),
			close: ( ev ) => this._close( ev )
		};
		
	}

	/**
	 * @method	connectedCallback
	 * 
	 * Realiza las tareas necesarias al conectar el componente.
	 */
	connectedCallback() {
		super.connectedCallback();

		// Activamos listeners

		this.input.addEventListener( "keyup", this.functions.keyup, true );
		document.addEventListener( "click", this.functions.close, true );

		// Asignamos el icono

		this._set_icon();

		// Posicionamos el datalist
		
		this._position_datalist();

		this.listenScroll = this._scroll_event.bind( this );
	}

	/**
	 * @method	disconnectedCallback
	 * 
	 * Realiza las tareas necesarias al desconectar el componente.
	 */
	disconnectedCallback() {
		super.disconnectedCallback();

		// Activamos listeners

		this.input.removeEventListener( "keyup", this.functions.keyup, true );
		document.removeEventListener( "click", this.functions.close, true );
	}

	/**
	 * @method	_set_icon
	 * 
	 * Asigna un icono específico si viene dado.
	 */
	_set_icon() {
		if( this.datalist.hasAttribute( "icon" )) {
			this.icon = this.datalist.getAttribute( "icon" );
		}
	}

	/**
	 * @method	_create
	 * 
	 * Crea el datalist con todas sus opociones.
	 */
	_create() {
		// Comprobamos si han de mostrarse los values.

		if( this.datalist.hasAttribute( "showvalues" )) {
			this.dlshwovalue = true;
		}
		
		// Creamos las opciones.

		let options = this.datalist.querySelectorAll( "option" );
		this.options = [];

		for( let i = 0; i < options.length; i++ ) {
			let inner = options[ i ].innerHTML;
			let value = options[ i ].value;
			let valueShow = ( this.dlshwovalue ) ? value : "";

			if ( inner === "" ) {
				inner = value;
				valueShow = "";
			}
			this.push( "options", { value: value, inner: inner, valueShow: valueShow })
		}

		// Cogemos las dimensiones de los options

		setTimeout(() => {
			var divOpts = this.$.datalist;
			var clon = divOpts.cloneNode( true );
			clon.style.display = "block";

			// Creamos el elemento provisional e introducimos el clon

			var prov = document.createElement( "DIV" );
			prov.style.position = "absolute";
			prov.style.zIndex = "-1000";
			prov.style.opacity = "0";

			prov.appendChild( clon );

			document.body.appendChild( prov );

			// Ancho del span

			var spans = clon.querySelectorAll( "span" );
			var widthSpan = 0;
			for( var i = 0; i < spans.length; i++ ) {
				widthSpan = ( spans[ i ].offsetWidth > widthSpan ) ? spans [ i ].offsetWidth : widthSpan;
			}

			// Asignamos el ancho y el alto

			this.width = clon.offsetWidth + widthSpan + 30;
			this.height = clon.offsetHeight;

			divOpts.style.width = this.width + "px";

			// Eliminamos el elemento provisional

			if( prov.parentNode ) {
				document.body.removeChild( prov );
			}
		}, 500);
	}

	/**
	 * @method	_position_datalist
	 * 
	 * Ajusta la posición del datalist sobre el input.
	 */
	_position_datalist() {
		/*let div_container = this.input.parentElement;
		
		let cont = 0;
		while( div_container.id !== "container" || !div_container.classList.contains( "container" ) ) {
			if( cont == 5 ) {
				break;
			}

			div_container = div_container.parentElement;
			cont++;
		}
		
		let top = div_container.offsetTop + this.input.offsetHeight - 1;
		this.style.top = top + "px";*/
	}

	/**
	 * @method	_open
	 * 
	 * Abre las opciones del datalist.
	 */
	_open() {
		if( !this.dlvisible ) {
			// Quitamos el option seleccionado

			this.selected = null;

			// Ponemos que el datalist es visible

			this.dlvisible = true;

			// Guardamos el scroll top

			this._set_scrolltop();

			// Mostramos las opciones

			this._slide_element();

			// Posicionamos las opciones

			this._position_options();

			// Evita el scroll de la pantalla

			window.addEventListener( "scroll", this.listenScroll);
		}
	}

	/**
	 * @method	_close
	 * 
	 * Cierra las opciones del datalist.
	 */
	_close() {
		if( this.dlvisible ) {
			this.dlvisible = false;
			this.$.datalist.style.display = "none";
			this.$.datalist.removeAttribute( "top" );

			window.removeEventListener( "scroll", this.listenScroll);
		}
	}

	/**
	 * @method	_select_option
	 * 
	 * Selecciona una opción del datalist.
	 * 
	 * @param	{object}		event			Evento devuelto al hacer click sobre una opción.
	 * @param	{object}		element			Elemento enviado al pulsar intro sobre una opción.
	 */
	_select_option( event, element ) {
		var target = null;

		// Cogemos el target según sea un elemento (pulsar enter) o un evento (click con mouse)
		// Esta función se dispara cuando seleccionamos una de las opciones del datalist

		if ( event ) {
			target = event.target;
		} else {
			target = element;
		}

		// Si no hay target devolvemos false

		if ( !target ) {
			return false;
		}

		// Asignamos el value

		var value = target.getAttribute( "value" );

		// Introducimos el valor del input

		this.input.value = value;
	}

	/**
	 * @method	_next
	 * 
	 * Pasa a la siguiente opción del datalist al pulsar la flecha abajo en el teclado.
	 */
	_next() {
		if ( !this.selected || this.selected.nextElementSibling.tagName !== "DIV" ) {
			this.selected = this.$.datalist.firstElementChild;
		} else if ( this.selected.nextElementSibling ) {
			this.selected = this.selected.nextElementSibling;
		}
	}

	/**
	 * @method	_preview
	 * 
	 * Pasa a la siguiente opción del datalist al pulsar la flecha arriba en el teclado.
	 */
	_preview() {
		if ( !this.selected || !this.selected.previousElementSibling ) {
			let ultimo = this.$.datalist.lastElementChild.previousElementSibling;
			this.selected = ultimo;
		} else if ( this.selected.previousElementSibling ) {
			this.selected = this.selected.previousElementSibling;
		}
	}

	/**
	 * @method	_selected_changed
	 * 
	 * Ajusta las opciones del datalist cuando cambia alguuna de las opciones seleccionadas.
	 */
	_selected_changed( selected, oldSelected ) {
		if (oldSelected ) {
			oldSelected.removeAttribute( "selected" );
		}

		if ( selected ) {
			selected.setAttribute( "selected", "" );
		}
	}

	/**
	 * @method	_set_scrolltop
	 * 
	 * Asigna el scrolltop teniendo en cuenta el scrolltop de la ventana así como
	 * el scrolltop de los padres si tienen algún tipo de overflow.
	 */
	_set_scrolltop() {
		this.scrolltop = (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;

		var parent = this.datalist.parentElement;
		while( parent.tagName !== "BODY" ) {
			this.scrolltop += parent.scrollTop;
			parent = parent.parentElement;
		}
	}

	/**
	 * @method	_slide_element
	 * 
	 * Despliega las opciones con un efecto de persiana.
	 */
	_slide_element() {
		this.$.datalist.style.height = "0px";
		this.$.datalist.style.transition = "height .15s ease";
		this.$.datalist.style.overflow = "hidden";
		this.$.datalist.style.display = "block";

		setTimeout(() => {
			this.$.datalist.style.height = this.height + "px";
		});

		setTimeout(() => {
			this.$.datalist.style.height = "";
			this.$.datalist.style.transition = "";
			this.$.datalist.style.overflow = "";

			if( window.innerHeight < 400 ) {
				this.$.datalist.style.height = "100px";
			} else {
				this.$.datalist.style.height = "";
			}
		}, 150);
	}

	/**
	 * @method	_setPosition
	 * 
	 * Asigna la posición de las opciones cuando se abren
	 * 
	 * @param	{object}		ev			Evento devuelto en el listener
	 */
	_position_options() {
		var options = this.$.datalist;
		var position = this.getBoundingClientRect();

		// Ponemos la posición abajo por defecto.

		options.style.marginTop = "-" + this.scrolltop + "px";

		// Obtenemos la posición de las opciones.

		var optspos = options.getBoundingClientRect();

		// Cogemos el input y el alto de las opciones.

		var input = this.datalist.parentElement.inputElement;
		var h = ( this.height > 300 ) ? 300 : this.height;

		// Asignamos la altura si hay altura de las opciones.

		if( options.offsetHeight > 0 ) {
			h = options.offsetHeight;
		}
		
		// Posicionamos las opciones arriba si corresponde.

		if( optspos.top + h > window.innerHeight || options.hasAttribute( "top" )) {
			options.setAttribute( "top", "" );
			options.style.marginTop = "-" + ( this.scrolltop + input.offsetHeight + h ) + "px";
		}

		/*if( position.top + options.offsetHeight > this.scrolltop + window.innerHeight ) {
			var input = this.datalist.parentElement.inputElement;

			var h = ( this.height > 300 ) ? 300 : this.height;
			if( options.offsetHeight > 0 ) {
				h = options.offsetHeight;
			}

			options.style.marginTop = "-" + ( this.scrolltop + input.offsetHeight + h ) + "px";
		}*/

		// Ajustamos el ancho de las opciones.

		if( this.width > window.innerWidth - 40 ) {
			options.style.marginLeft = "-" + ( position.left - 10 ) + "px";
			options.style.width = window.innerWidth - 40 + "px";
		}

		// Si no hay altura y tiene el atributo top, volvemos a llamar a la función.
		
		if( options.offsetHeight == 0 && options.hasAttribute( "top" )) {
			setTimeout(() => {
				this._position_options();
			}, 200);
		}
	}

	/**
	 * @method	_filtering
	 * 
	 * Filtra las opciones en función del contenido que se haya introducido en el 
	 * input.
	 * 
	 * @param	{string}	string			Valor del input.
	 */
	_filtering( string ) {
		if ( !string ) {
			return null;
		} else {
			string = string.toLowerCase();

			return function( option ) {
				var value = option.value.toLowerCase();
				var inner = option.inner.toLowerCase();
				return (value.indexOf( string ) != -1 || inner.indexOf(string) != -1);
			}
		}
	}
	
	/**
	 * @method	_keyup
	 * 
	 * Acciones a realizar cuando se levanta la tecla sobre el input.
	 */
	_keyup( ev ) {
		this.string = this.input.value;

		// Ajustamos posición

		setTimeout(() => {
			this._position_options();
		}, 20);

		// Al pulsar enter

		if( ev.keyCode === 13 ) {
			this._close();
			this._select_option( "", this.selected );
		} else {
			this._open();
		}

		// Al pulsar la flecha arriba

		if ( ev.keyCode === 40 && this.dlvisible ) {
			this._next();
		}

		// Al pulsar la flecha abajo

		if ( ev.keyCode === 38 && this.dlvisible ) {
			this._preview();
		}
	}

	/**
	 * @method	_scroll_event
	 * 
	 * Evita el scroll de la página cuando están abiertas las opciones.
	 * 
	 * @param	{object}		ev			Evento devuelto en el listener
	 */
	_scroll_event( ev ) {
		window.scroll( 0, this.scrolltop );
	}
}

window.customElements.define( "aw-input-datalist", AwInputDatalist );