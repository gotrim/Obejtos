console.log(base);

base.width = 800;
base.height = 800;

let dz = 1;
let angulo = 0;

const con = base.getContext("2d");
const FPS = 30;
const dt = 1/FPS;
const vs = [
    {x: -0.25, y:  0.25, z:  0.25},
    {x:  0.25, y: -0.25, z:  0.25},
    {x:  0.25, y:  0.25, z:  0.25},
    {x: -0.25, y: -0.25, z:  0.25},

    {x: -0.25, y:  0.25, z: -0.25},
    {x:  0.25, y: -0.25, z: -0.25},
    {x:  0.25, y:  0.25, z: -0.25},
    {x: -0.25, y: -0.25, z: -0.25},
]                           
const fs = [
    [0, 1, 2, 3],
    [4, 5, 6, 7],
]

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

function linha(p1, p2){
    con.strokeStyle = interior;
    con.beginPath()
    con.moveTo(p1.x, p1.y);
    con.lineTo(p2.x, p2.y);
    con.stroke();
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

function rotacao_xz({x, y, z}, angulo){
    const c = Math.cos(angulo);
    const s = Math.sin(angulo);
    return {
        x : x*c - z*s,
        y,
        z : x*s + z*c,
    };
// ___________________________________________________
//| Aqui iremos rotacionar vetores para, que possamos |
//| ver melhor o Objeto que temos                     |
//|___________________________________________________|
}

function transa_Z({x, y, z}, dz){
    return {x, y, z: z + dz};
}

function quadros(){
    //dz += 1*dt; (serve para distanciar o Objeto)
    angulo += Math.PI*dt;
    limpar();
    for (const v of vs){
    pont(tela(progecao(transa_Z(rotacao_xz(v, angulo), dz))));
    }
    for (const f of fs){
        for (let i = 0; i < f.length; ++i){
            const a = vs[f[i]];
            const b = vs[f[(i+1)%f.length]];
            linha (
                tela(progecao(transa_Z(rotacao_xz(a, angulo), dz))),
                tela(progecao(transa_Z(rotacao_xz(b, angulo), dz))),
            )
        }
    // _________________________________________________________________
    //| com isso ele vai pegar o array e fazer uma caminho entre eles   |
    //| começando no ( 0 > 1 | 1 > 2 ) e por ai vai ate chegar no final |
    //|_________________________________________________________________|
    }
    setTimeout(quadros, 1000/FPS);
    // __________________________________________________________
    //| usando (DZ) ele esta fazendo uma pequena animação em     |
    //| quadros por segundos (FPS) distanciando todos os obejtos |
    //| com base na velocidade da passagem dos quadros (60)      |
    //|__________________________________________________________|
}

setTimeout(quadros, 1000/FPS);