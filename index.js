console.log(base);

base.width = 800;
base.height = 800;

const con = base.getContext("2d");
const FPS = 60;
const dt = 1/FPS;
const vs = [
    {x: -0.5, y:  0.5, z: 0.5},
    {x:  0.5, y: -0.5, z: 0.5},
    {x:  0.5, y:  0.5, z: 0.5},
    {x: -0.5, y: -0.5, z: 0.5},

    {x: -0.5, y:  0.5, z: -0.5},
    {x:  0.5, y: -0.5, z: -0.5},
    {x:  0.5, y:  0.5, z: -0.5},
    {x: -0.5, y: -0.5, z: -0.5},
]
// _________________________________________________________
//| seria como sair de dentro de um quadrado para poder ver |
//|_________________________________________________________|
let dz = 1;

const fundo = "#1A1A1A";
const interior = "#8DB600";

console.log(con);

function limpar(){
    con.fillStyle = fundo;
    con.fillRect(0, 0, base.width, base.height);
}
// ____________________________________________________________
//| função principal define o (X) eo (Y) assim como a Area (A) |
//|____________________________________________________________|
function pont({x, y}){
    const a = 20;
    con.fillStyle = interior;
    con.fillRect(x - a/2,  y - a/2,  a,  a);
    // __________________________________________________________
    //| X (que ta sendo diminido pela metade do espaço da tela)  |
    //| y (mesma coisa)                                          |
    //| Largura maxima do espaço                                 |
    //| Altura maxima do espaço                                  |
    //|__________________________________________________________|
    // ( Só pra lembrar oq é cada coisa)
}

function tela(p){
    // _______________________________________________________
    //| Como a função a de cima define tudo com (X) e (Y)     |
    //| essa função normaliza as cordenadas para que o Objeto |
    //| não fuja da Area (A)                                  |
    //|_______________________________________________________|
    // ______________________________________________
    //| -1..1 => 0..2 => 0..1 => 0..* (e por ai vai) |
    //|______________________________________________|
    return {
        x: (p.x + 1)/2*base.width,
        y: (p.y + 1)/2*base.height,
    }
}

function progecao({x,y,z}){
    return {
        x: x/z,
        y: y/z,
    }
}
// __________________________________________________________________
//| O elemento (Z) controla o plano visto de frente, fazendo objetos |
//| mais proximos do centro parecerem maior colocando um (Z) menor e |
//| mais distantes do centro parecerem menor colocando um (Z) maior  |
//| se colocar um (Z) como 0 ele mão vai aparecer                    |
//|__________________________________________________________________|
function transa_Z({x, y, z}, dz){
    return {x, y, z: z + dz};
}

function quadros(){
    dz += 1*dt;
    limpar();
    for (const v of vs){
    pont(tela(progecao(transa_Z(v, dz))));
}
    setTimeout(quadros, 1000/FPS);
    // __________________________________________________________
    //| usando (DZ) ele esta fazendo uma pequena animação em     |
    //| quadros por segundos (FPS) distanciando todos os obejtos |
    //| com base na velocidade da passagem dos quadros (60)      |
    //|__________________________________________________________|
}

setTimeout(quadros, 1000/FPS);
