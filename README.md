# AW-FORM-HELPERS

Componentes de ayuda para los componentes de formulario de Arisman Webs. Los `helpers` que tenemos son:

- [aw-char-counter](#aw-char-counter): Contador de caracteres para los inputs de Arisman Webs.
- [aw-input-datalist](#aw-input-datalist): Listas desplegables para los inputs de Arisman Webs.
- [aw-input-error](#aw-input-error): Mensajes de error para los inputs de Arisman Webs.

___

## aw-char-counter

Con este `helper` podemos crear de manera simple un contador de caracteres. El desarrollo de este helper está en aw-char-counter-mixin. Añadirlo a un componente es muy sencillo:

```javascript
import {PolymerElement, html} from '/node_modules/aw_polymer_3/polymer/polymer-element.js';
import "/node_modules/aw_form_helpers/aw-char-counter.js";
class MyComponent extends AwInputCharCounterMixin( PolymerElement ) {
  static get template() { 
    return html`
    <input id="input" name="input" on-keyup="_keyup">
    <aw-char-counter>{{countCharStr}}</aw-char-counter>
    `;
  }

  static get properties() {
    return {
      input: { type: Object, value: null },
    }
  }

  connectedCallback() {
    super.connectedCallback();

    // Asignamos el inputElement
    this.input = this.$.input;

    // Activamos el contador de caracteres
    this.set_countchar()
  }

  _keyup() {
    // LLamamos a super._keyup() para que cuente los caracteres del input
    super._keyup();
  }
}

window.customElements.define( "my-component", MyComponent );
```

Como se puede observar, el funcionamiento del helper requiere de ciertos factores inmutables. 

1. Uno no hacer uso de propiedades reservadas para el componente `( countchar y countCharStr )`.
2. El input donde se van a contar los caracteres tiene que estar en una propiedad llamada `inputElement`.
3. En el método `connectedCallaback()` se tiene que llamar al método `this.putCountChar()` que activará el contador.
4. Tenemos que definir un método llamado `_keyup()` que será el que escuche el evento de levantar la tecla del teclado y dentro de éste llamar a la función `super._keyup()` para enlazarla con el componente.

Con estos pasos nuestro contador de caracteres ya estaría funcionando en nuestro componente.

### **Dar estilo al countchar**

El `aw-char-counter` está pensado para trabajar conjuntamente con los `aw-inputs-***`, de manera que por defecto tendrá el comportamiento y el estilo ajustado para estos inputs de Arisman Webs.

Los estilos que puede tener el contador se regulan con las siguientes variables que muestra los valores por defecto:

```css
--aw-countchar-position: relative;
--aw-countchar-top: auto;
--aw-countchar-right: auto;
--aw-countchar-bottom: auto;
--aw-countchar-left: auto;
--aw-countchar-padding: 0;
--aw-countchar-margin: 0;
--aw-countchar-color: --aw-input-label-color | #888888;
--aw-countchar-font-family: --aw-input-font-family | arial;
--aw-countchar-font-weight: --aw-input-font-weight | normal;
--aw-countchar-font-size: 12px;
--aw-countchar-text-align: right;
--aw-countchar-color-focused: --aw-input-label-color-focused | --aw-primary-color | #1C7CDD;
--aw-countchar-error-color: --aw-input-error-color | --aw-error-color | #b13033;
```
___

## aw-input-datalist

Con este `helper` podemos crear un datalist a un input con múltiples opciones que nos permitirán configurarlo de manera muy eficiente. Añadirlo a un componente es una tarea un poco más delicada que el `aw-char-counter` ya que hay que tener más factores en cuenta para hacerlo funcionar:

```javascript
import {PolymerElement, html} from '/node_modules/aw_polymer_3/polymer/polymer-element.js';
import "/node_modules/aw_form_helpers/aw-input-datalis.js";

class MyComponent extends AwInputDatalist( PolymerElement ) {
  static get template() { 
  return html`
    <input id="input" name="input" on-keyup="_keyup">
	
    <template id="datalist" is="dom-if" if="{{datalist}}">
      <aw-input-datalist input="{{myInput}}" datalist="{{datalist}}" dlvisible="{{dlvisible}}"></aw-input-datalist>
    </template>
    `;
  }

  static get properties() {
    return {
      myInput: { type: Object, value: null },

      // Propuedades necesarias para el datalist
      list: { type: String },
      datalist: { type: Object },
      dlvisible: { type: Boolean, value: false, notify: true },
      observDl: { type: Object }
    }
  }

  connectedCallback() {
    super.connectedCallback();

    // Asignamos el input a una propiedad que pasaremos al datalist
    this.myInput = this.$.input;

    // Creamos un método que activará o creará el datalist
    this._activateDatalist();
  }

  disconnectedCallback() {
    // Si activelist es verdadero
    if( this.datalist ) {
      // Desconectamos el MutationObserver del datalist
      this.observDl.disconnect();
    }
  }

  _activateDatalist() {
     if ( this.list ) {
       // Obtenemos las opciones del datalist
       this.datalist = this.shadowRoot.querySelector( "slot [name=datalist]" ).assignedNodes()[ 0 ];
       
       // Si hay opciones o el activelist es verdadero
       if( this.datalist.options.length > 0 || this.activelist ) {
          // Creamos un MutationObserver del datalist si queremos que sea activo
          this.observDl = new MutationObserver(  this._observerDatalist.bind( this ));
          this.observDl.observe( this, { childList: true } );
       } else {
         this.datalist = false;
       }
     }
  }

  /**
   * @method	_oberverDatalist
   * 
   * Esta método solo será necesario si queremos que el datalist sea activo
   * es decir, que si cambiamos los options del datalist en el aw-input,
   * estos se actualicen atomáticamente.
   * 
   * @param 	{string} 	ev		Evento enviado por el MutationObserver
   */
  _observerDatalist( ev ) {
    // Obtenemos el viejo datalist.

    var oldDatalist = ev[ 0 ].target;

    // Creamos el nuevo datalist

    var newDatalist = document.createElement( "DATALIST" );
    for( var i = 0; i < this.datalist.attributes.length; i++ ) {
	  newDatalist.setAttribute( this.datalist.attributes[ i ].name,   this.datalist.attributes[ i ].value );
    }

    newDatalist.innerHTML = this.datalist.innerHTML;

    // Asignamos el nuevo datalist.

    this.datalist = newDatalist;

    this.removeChild( oldDatalist );
    this.appendChild( this.datalist );

    // Volvemos a poner a la escucha el nuevo datalist.

    this.observDl.disconnect();
    this.observDl = new MutationObserver( this._observe_datalist.bind( this ));
    this.observDl.observe( this.datalist, { childList: true } );
  }
}

window.customElements.define( "my-component", MyComponent );
```

Lo primero a tener en cuenta es introducirlo dentro de un `dom-if` que mostrará el datalist en función de que la propiedad `datalist` sea verdadera.

#### Propiedades:

- `list`: Propiedad pasada al componente a través de un atributo html.
- `datalist`: Un objeto donde alamacenaremos los elementos de la lista.
- `dlvisible` <font style="color: #B40431;">(No cambiar nombre)</font>: Tipo boleano que indica si el datalist es visible.
- `observDl`: Un objeto que servirá para observar los cambios en el datalist

Con respecto a las propiedades, nótese que la propiedad `dlvisible` **debe llevar la propiedad notify** ya que ésta notificará al componente `aw-input-datalist`. 

#### Métodos:

`_activateDatalist()`:

Este método activará el datalist si el componente tiene el atributo **list**. Del mismo modo. Si queremos que el datalist sea activo, es decir, que cambie si cambiamos los options del datalist, se tendra que crear un MutationObserver que refrescara las opciones de **datalist** si las opciones se modifican.

`_observerDatalist()`:

Este método será llamado por el MutationObserver si hay que refrescar las opciones.

`disconnectedCallback()`:

Si el activelist es verdadero, desconectamos el MutationObserver.

#### Ejemplo:

Nótese que para añadir el datalist se siguen los mismos pasos que para añadir un datalist nativo del navegador con la peculiaridad que el **datalist** tiene que llevar el atributo `slot="datalist"`, ya que será como lo identificamos en el componente.

Si queremos que el datalist sea dinámico tan solo habrá que cambiar los options del datalist y estos se refrescarán automáticamete si en el componente se configuró esta opción somo se explica en el código superior:

```html
<aw-input-df id="myInput" label="Nombre" name="nombre" list="mylist">
    <datalist id="mylist" slot="datalist">
        <option value="Sevilla"></option>
        <option value="Barcelona"></option>
        <option value="Madrid"></option>
        <option value="Cáceres"></option>
        <option value="Cuenca"></option>
    </datalist>
</aw-input-df>
```

```javascript
var datalist = document.getElementById( "mylist" );
var newOptions = `
<option value="Valencia"></option>
<option value="Valladolid"></option>
<option value="Salamanca"></option>
<option value="Bilbao"></option>
<option value="La Coruña"></option>
`;

datalist.innerHTML = newOptions;
```

### **Dar estilo al datalist**

El `aw-input-datalist` está pensado para trabajar conjuntamente con los `aw-inputs-***`, de manera que por defecto tendrá el comportamiento y el estilo ajustado para estos inputs de Arisman Webs.

Los estilos que puede tener el datalist se regulan con las siguientes variables que muestra los valores por defecto:

```css
--aw-input-datalist-arrow-top: -27px;
--aw-input-datalist-arrow-background-color: transparent;
--aw-input-datalist-arrow-background-color-hover: transparent;
--aw-input-datalist-arrow-color: #999999;
--aw-input-datalist-arrow-color-hover: --aw-primary-color | #1C7CDD;
--aw-input-datalist-background-color: white;
--aw-input-datalist-background-color-hover: #f6f6f6;
--aw-input-datalist-box-shadow: 0px 1px 3px #777777;
--aw-input-datalist-color: --aw-input-color | #333333;
--aw-input-datalist-color-hover: #3A9AE0;
--aw-input-datalist-options-color: 
--aw-input-datalist-option-padding: 13px 10px;
--aw-input-datalist-option-font-family: --aw-input-font-family | arial;
--aw-input-datalist-option-font-size: 14px;
--aw-input-datalist-value-background-color: white;
--aw-input-datalist-value-color: #777777;
--aw-input-datalist-value-font-size: 11px;
```
___

## aw-input-error

Con este `helper` podemos crear de manera simple de mostrar errores en los inputs de manera atractiva. El uso de este componente depende de `aw-input-error-mixin`. Añadirlo a un componente es muy sencillo:

```javascript
import {PolymerElement, html} from '/node_modules/aw_polymer_3/polymer/polymer-element.js';
import {AwInputErrorMixin} from '/node_modules/aw_form_mixins/aw-input-error-mixin.js';

import "/node_modules/aw_form_helpers/aw-input-error.html";

class MyComponent extends AwInputErrorMixin( Polymer.Element ) {
  static get template() { 
    return html`
    <input id="input" name="input" errmsg$="{{errmsg}}">
    <aw-input-error errmsg="{{errmsg}}" element="{{inputElement}}">{{errmsg}}    </aw-input-error>
    `;
  }

  static get properties() {
    return {
     inputElement: { type: Object, value: null },
    }
  }

  connectedCallback() {
    super.connectedCallback();

    // Asignamos el inputElement
    this.inputElement = this.$.input;

    // Escuhamos los errores
    this.error_listen();
  }
}

window.customElements.define( 'my-component', MyComponent );
```

Como se puede observar, el funcionamiento del helper requiere de ciertos factores inmutables. 

1. Uno no hacer uso de propiedades reservadas para el componente `( error y errmsg )`.
2. El input donde se van a contar los caracteres tiene que estar en una propiedad llamada `inputElement`.
3. En el método `connectedCallaback()` se tiene que llamar al método `this.error_listen()` que activara la escucha de los errores.

Con estos pasos nuestro observador de errores ya estará listo, para hacerlo funcionar tan solo tendremos que asignar el atributo `errmsg`.

```html
<my-component></my-component>

<script>
    var input = document.querySelector( "my-component" );
	
    setTimeout(() => {
        input.setAttribute( "errmsg", "Este es el error" );
    }, 2000);
	
    setTimeout(() => {
        input.setAttribute( "errmsg", "" );
    }, 4000);
</script>
```

### **Dar estilo al aw-input-error**

El `aw-input-error` está pensado para trabajar conjuntamente con los `aw-inputs-***`, de manera que por defecto tendrá el comportamiento y el estilo ajustado para estos inputs de Arisman Webs.

En el ejemplo superior, el mensaje de error quedará situado arriba a la derecha.

Los estilos que puede tener el mensaje de error se regulan con las siguientes variables que muestra los valores por defecto:

```css
--aw-helper-input-error-position: relative;
--aw-helper-input-error-top: auto;
--aw-helper-input-error-right: auto;
--aw-helper-input-error-bottom: auto;
--aw-helper-input-error-left: auto;
--aw-helper-input-error-padding: 0;
--aw-helper-input-error-margin: 0;
--aw-input-error-color: #b13033;
--aw-input-error-font-family: --aw-input-font-family | arial;
--aw-input-error-font-weight: --aw-input-font-weight | normal;
--aw-input-error-font-size: 11px;
--aw-input-error-white-space: nowrap;
```

______________________________

<p style="text-align: center; padding: 50px 0">
    <b>Contacto</b><br><br>Manu J. Overa<br><a href="mailto:manu.giralda@gmail.com">manu.giralda@gmail.com</a><br><br>
    <!-- Diseño Web - <a href="https://arismanwebs.es">Arisman Webs</a> -->
</p>







