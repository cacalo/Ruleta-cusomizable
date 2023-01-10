
const ruleta = document.getElementById("ruleta");
const opcionesContainer = document.getElementById("opcionesContainer");
let opciones = Array.from(document.getElementsByClassName("opcion"));
const root = document.documentElement;
const formContainer = document.getElementById("formContainer");
const modal = document.querySelector("dialog");
const totalElement = document.getElementById("porcentaje");
const botonCancelar = document.getElementById("cancelar");
const botonAceptar = document.getElementById("aceptar");
const botonAgregar = document.getElementById("agregar");
const ganadorTextoElement = document.getElementById("ganadorTexto");
let ganador = "";
let animacionCarga;
let escala = screen.width < 412 ? screen.width * 0.7 : 400;
let sorteando = false;

/** Contiene la suma actual de probabilidades en base 100 */
let suma = 0;

root.style.setProperty("--escala",escala+"px");

const uno = {
	nombre: "Uno",
	probabilidad:20
}

const dos = {
	nombre: "Dos",
	probabilidad: 20
}

const tres = {
	nombre: "Tres",
	probabilidad: 30
}
const cuatro = {
	nombre: "Cuatro",
	probabilidad: 30
}

let probabilidades = [uno,dos,tres,cuatro];


/** Pone a girar la ruleta y hace el sorteo del resultado */
function sortear(){
	sorteando = true;
	ganadorTextoElement.textContent = ".";
	animacionCarga = setInterval(()=>{
		switch( ganadorTextoElement.textContent){
			case ".":
				ganadorTextoElement.textContent = ".."
				break;
			case "..":
				ganadorTextoElement.textContent = "..."
				break;
			default:
				ganadorTextoElement.textContent = "."
				break;
		}
	} ,500)
	const nSorteo = Math.random();
	const giroRuleta = (1-nSorteo)*360 + 360*10; //10 vueltas + lo aleatorio - el giro actual
	root.style.setProperty('--giroRuleta', giroRuleta + "deg");
	ruleta.classList.toggle("girar",true)
	let pAcumulada = 0;
	probabilidades.forEach(objeto => {
		if(nSorteo*100 > pAcumulada && nSorteo*100 <= pAcumulada+objeto.probabilidad){
			ganador = objeto.nombre;
			//console.log("Ganador", nSorteo*100, objeto.nombre, "porque está entre ",pAcumulada, "y",pAcumulada+objeto.probabilidad)
		};
		pAcumulada +=objeto.probabilidad;
	})
}

ruleta.addEventListener("animationend", ()=>{
	ruleta.style.transform = "rotate("+getCurrentRotation(ruleta)+"deg)";
		ruleta.classList.toggle("girar",false)
		sorteando=false;
		ganadorTextoElement.textContent = ganador;
		clearInterval(animacionCarga);
})

/** Contiene la lista de colores posibles para el gráfico */
const colores=[
	"126253","134526","C7B446","5D9B9B","8673A1","100000"
]

/** Crea todas las partes del elemento ruleta */
function ajustarRuleta (){
	opciones = Array.from(document.getElementsByClassName("opcion"));
	opciones.forEach(opcion => opcionesContainer.removeChild(opcion));
	Array.from(document.getElementsByClassName("separador")).forEach(opcion => opcionesContainer.removeChild(opcion));
	let pAcumulada = 0
	probabilidades.forEach((probabilidad, i) => {
		//Creo triangulos de colores
		const opcionElement = document.createElement("div");
		opcionElement.classList.toggle("opcion",true);
		opcionElement.style = `
			--color: #${colores[i%colores.length]};
			--deg:${probabilidadAGrados(pAcumulada)}deg;
			${getPosicionParaProbabilidad(probabilidad.probabilidad)}`
		opcionElement.addEventListener("click", ()=> onOpcionClicked(i))
		opcionesContainer.appendChild(opcionElement);
		//Creo textos
		const nombreElement = document.createElement("p");
		nombreElement.textContent = probabilidad.nombre;
		nombreElement.classList.add("nombre");
		nombreElement.style = `width : calc(${probabilidad.probabilidad} * var(--escala) * 1.5 / 70);
		transform: rotate(${probabilidadAGrados(probabilidad.probabilidad)/2}deg)`
		opcionElement.appendChild(nombreElement);
		//Creo separadores
		const separadorElement = document.createElement("div");
		separadorElement.style = `transform: rotate(${probabilidadAGrados(pAcumulada)}deg)`
		separadorElement.classList.add("separador");
		opcionesContainer.appendChild(separadorElement);
		pAcumulada += probabilidad.probabilidad;
	})
}


/** Recibe un Nº base 1 y devuelve un Nº base 360 */
function probabilidadAGrados(probabiliad){
	return probabiliad * 360 / 100;
}

document.getElementById("sortear").addEventListener("click", () => {
	if(!sorteando) sortear()
})

/** Devuelve la rotación en grados de un elemento */
function getCurrentRotation(el){
  var st = window.getComputedStyle(el, null);
  var tm = st.getPropertyValue("-webkit-transform") ||
           st.getPropertyValue("-moz-transform") ||
           st.getPropertyValue("-ms-transform") ||
           st.getPropertyValue("-o-transform") ||
           st.getPropertyValue("transform") ||
           "none";
  if (tm != "none") {
    var values = tm.split('(')[1].split(')')[0].split(',');
    var angle = Math.round(Math.atan2(values[1],values[0]) * (180/Math.PI));
    return (angle < 0 ? angle + 360 : angle);
  }
  return 0;
}

function onOpcionClicked(i){
	Array.from(formContainer.children).forEach(element => formContainer.removeChild(element))
	probabilidades.forEach(probabilidad =>{
		agregarConfiguracionProbabilidad(probabilidad);
	})
	modal.showModal();
	verificarValidezFormulario()
}

botonCancelar.addEventListener("click",()=> {
	modal.close();
});
botonAceptar.addEventListener("click",()=> {
	probabilidades = Array.from(formContainer.children).map(opcion =>
		nuevaProbabilidad = {
			nombre: opcion.children[0].tagName==="LABEL" ? opcion.children[0].textContent : opcion.children[0].value,
			pInicial: 0,
			probabilidad: parseFloat(opcion.children[1].value)
	})
	ajustarRuleta()
	modal.close()
});

//Heptágono en Clippy https://bennettfeely.com/clippy/
//100% 360º - clip-path: polygon(50% 0%, 100% 0, 100% 100%, 0 100%, 0 0, 50% 0, 50% 50%)
//87.5 315º - clip-path: polygon(50% 0%, 100% 0, 100% 100%, 0 100%, 0 0, 0 0, 50% 50%)
//75% 270º - clip-path: polygon(50% 0, 100% 0, 100% 100%, 0 100%, 0 50%, 50% 50%)
//62.5% 225º - clip-path: polygon(50% 0, 100% 0, 100% 100%, 0 100%, 0 100%, 50% 50%)
//50%	180º - clip-path: polygon(50% 0, 100% 0, 100% 100%, 50% 100%, 50% 50%)
//37.5%	135º - clip-path: polygon(50% 0, 100% 0, 100% 100%, 100% 100%, 50% 50%)
//25%	90º - clip-path: polygon(50% 0, 100% 0, 100% 49%, 50% 50%)
//12.5%	45º - clip-path: polygon(50% 0, 100% 0, 100% 6%, 50% 50%)
//1%	3.6º - clip-path: polygon(50% 0, 51% 0, 50% 50%);
//0%	3.6º - clip-path: polygon(50% 0, 50% 0, 50% 50%);

function getPosicionParaProbabilidad(probabilidad){
	if(probabilidad === 100){
		return ''
	}
	if(probabilidad >= 87.5){
		const x5 = Math.tan(probabilidadARadianes(probabilidad))*50+50;
		return `clip-path: polygon(50% 0%, 100% 0, 100% 100%, 0 100%, 0 0, ${x5}% 0, 50% 50%)`
	}
	if(probabilidad >= 75){
		const y5 = 100 - (Math.tan(probabilidadARadianes(probabilidad-75))*50+50);
		return `clip-path: polygon(50% 0%, 100% 0, 100% 100%, 0 100%, 0% ${y5}%, 50% 50%)`
	}
	if(probabilidad >= 62.5){
		const y5 = 100 - (0.5 - (0.5/ Math.tan(probabilidadARadianes(probabilidad))))*100;
		return `clip-path: polygon(50% 0%, 100% 0, 100% 100%, 0 100%, 0% ${y5}%, 50% 50%)`
	}
	if(probabilidad >= 50){
		const x4 = 100 - (Math.tan(probabilidadARadianes(probabilidad))*50+50);
		return `clip-path: polygon(50% 0, 100% 0, 100% 100%, ${x4}% 100%, 50% 50%)`
	}
	if(probabilidad >= 37.5){
		const x4 = 100 - (Math.tan(probabilidadARadianes(probabilidad))*50+50);
		return `clip-path: polygon(50% 0, 100% 0, 100% 100%, ${x4}% 100%, 50% 50%)`
	}
	if(probabilidad >= 25){
		const y3 = Math.tan(probabilidadARadianes(probabilidad-25))*50+50;
		return `clip-path: polygon(50% 0, 100% 0, 100% ${y3}%, 50% 50%)`
	}
	if(probabilidad >= 12.5){
		const y3 = (0.5 - (0.5/ Math.tan(probabilidadARadianes(probabilidad))))*100;
		return `clip-path: polygon(50% 0, 100% 0, 100% ${y3}%, 50% 50%)`
	}
	if(probabilidad >= 0){
		const x2 = Math.tan(probabilidadARadianes(probabilidad))*50 + 50;
		return `clip-path: polygon(50% 0, ${x2}% 0, 50% 50%)`
	}
}

function verificarValidezFormulario(){
	suma=0;
	Array.from(formContainer.children).forEach(opcion =>{
		suma += parseFloat(opcion.children[1].value);
	})
	if(suma !== 100){
		botonAceptar.disabled = true;
	} else{
		botonAceptar.disabled = false;
	}
	totalElement.textContent = suma.toString();

}

document.getElementById("agregar").addEventListener("click",() =>{
	agregarConfiguracionProbabilidad();
})

function agregarConfiguracionProbabilidad(probabilidad = undefined){
	const opcionContainer = document.createElement("div");
	let opcionLabel;
	const opcionInput = document.createElement("input");
	const eliminarBoton = document.createElement("button");
	if(probabilidad){
		opcionLabel = document.createElement("label");
		opcionLabel.textContent = probabilidad.nombre;
		opcionLabel.for = probabilidad.nombre;
		opcionInput.value = probabilidad.probabilidad;
		opcionLabel.type = "text";
	}
	else {
		opcionLabel = document.createElement("input");
	}
	opcionInput.type = "number";
	eliminarBoton.textContent = "X"
	opcionInput.addEventListener("change", ()=> verificarValidezFormulario())
	opcionContainer.appendChild(opcionLabel);
	opcionContainer.appendChild(opcionInput);
	opcionContainer.appendChild(eliminarBoton);
	formContainer.appendChild(opcionContainer);
	eliminarBoton.addEventListener("click",(event)=>{
		event.target.parentNode.parentNode.removeChild(event.target.parentNode);
		verificarValidezFormulario();
	})
}


function probabilidadARadianes(probabilidad){
	return probabilidad/100 * 2 * Math.PI;
}


/** Inicia ejecución */
ajustarRuleta();



/** Cómo dibujar ángulos en CSS */
// Al final no lo usé.
// https://stackoverflow.com/questions/21205652/how-to-draw-a-circle-sector-in-css
// x = cx + r * cos(a)
// y = cy + r * sin(a)
