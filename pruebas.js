a=[ 2,3,4,5,6,7];		//array
b={valor:2, tamaño:6}	//objeto
c=[
	{valor: 1, tamaño:5},
	{valor: 2, tamaño:3},
	]					//arreglo de objetos

a.forEach((elemento,contador,acompleto)=>{
console.log(a);
});

/* para objetos no funciona
b.forEach((elemento,contador,acompleto)=>{
console.log(b.elemento);
});
*/
console.warn("espacio")
c.forEach((elemento,contador,acompleto)=>{
	console.log("dato",contador);
	console.log("arreglo",acompleto)
	console.log("el tamaño de",contador,"es",elemento.tamaño);
});

////////////////////////////////////////////
/*ASYNC Y AWAIT*/


 






