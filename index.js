// ==========================================================
// 1. Obtém os elementos do DOM após o carregamento da pagina
// ==========================================================

console.log(base);
if (!base){
    console.error("Canvas não encontrado");
    throw new Error("Canvas ausente");
}

base.width = 400;
base.height = 400;
    // __________________
    //| Tamanho do cavas |
    //|__________________|

// ==========================================================
// 2. Elemento de controle
// ==========================================================

const bntEsq = document.getElementById("bntEsq");
const bntDir = document.getElementById("bntEsq");

if(!bntDir || !bntEsq) {
    console,error("Botões não encontrados");
}

// ==========================================================
// 3. Contexto de desenho e variáveis globais
// ==========================================================

const con = base.getContext("2d");
const FPS = 30;
const dt = 1/FPS;

//                 _______________________________________________________________
let dz = 1;     //| Distancia da câmera (dependendo do tamanho do Obejto diminua) |
let angulo = 0; //| ângullo atual de rotação                                      |
let direcao = 1;//| 1 = hhorário, -1 = anti-horario                               |
//                |_______________________________________________________________|

const fundo = "#1A1A1A";
const interior = "#8DB600";

// ==========================================================
// 4. Vértices do Objeto
// ==========================================================

const vs = [
    {x:  0.25, y:  0.25, z:  0.25},
    {x: -0.25, y:  0.25, z:  0.25},
    {x: -0.25, y: -0.25, z:  0.25},
    {x:  0.25, y: -0.25, z:  0.25},

    {x:  0.25, y:  0.25, z: -0.25},
    {x: -0.25, y:  0.25, z: -0.25},
    {x: -0.25, y: -0.25, z: -0.25},
    {x:  0.25, y: -0.25, z: -0.25},
];

// ==========================================================
// 5. Restas (Indices para desenhar linhas)
// ==========================================================

const fs = [
//                                     _______________
    [0, 1], [1, 2], [2, 3], [3, 0], //| Face frontal  |
    [4, 5], [5, 6], [6, 7], [7, 4], //| Face traseira |
    [0, 4], [1, 5], [2, 6], [3, 7], //| laterais      |
//                                    |_______________|
]

    // __________________________________________________________________________
    //| Nesse estudo do eu so utilizei duas faces e isso gerou um quadrado porem |
    //| com mais faces tudo é possivel                                           |
    //|__________________________________________________________________________|


// ==========================================================
// 6. Funções auxiliares (geometria)
// ==========================================================

function rotacao_xz({x, y, z}, angulo){
    const c = Math.cos(angulo);
    const s = Math.sin(angulo);
    return {
        x : x * c - z * s,
        y : y,
        z : x * s + z * c,
    };
    // __________________________________________
    //| Rotação no plano XZ (em torno do eixo Y) |
    //|__________________________________________|
}

function transa_Z({x, y, z}, dz){
    return {x, y, z: z + dz};
    // _____________________________________
    //| Translação em Z (afastar/aproximar) |
    //|_____________________________________|
}

function projecao({x,y,z}){
    return {
    //            ________________________
        x: x/z,//| Evita divisão por zero |
        y: y/z,//|________________________|
    }
    // ______________________________
    //| Projeção perspectiva simples |
    //|______________________________|
}
    // __________________________________________________________________
    //| O elemento (Z) controla o plano visto de frente, fazendo objetos |
    //| mais proximos do centro parecerem maior colocando um (Z) menor e |
    //| mais distantes do centro parecerem menor colocando um (Z) maior  |
    //| se colocar um (Z) como 0 ele mão vai aparecer                    |
    //|__________________________________________________________________|

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

// ==========================================================
// 7. Funções de desenho
// ==========================================================

function limpar(){
    con.fillStyle = fundo;
    con.fillRect(0, 0, base.width, base.height);
    // __________________________
    //| Reinicia o (X), (Y), (A) |
    //|__________________________|

}

function linha(p1, p2){
    con.strokeStyle = interior;
    con.beginPath()
    con.moveTo(p1.x, p1.y);
    con.lineTo(p2.x, p2.y);
    con.stroke();
}

function pont({x, y}){
    const a = 20;
    con.fillStyle = interior;
    con.fillRect(x - a/2,  y - a/2,  a,  a);
    // ____________________________________________________________
    //| Função principal define o (X) eo (Y) assim como a Area (A) |
    //|____________________________________________________________|
    // __________________________________________________________
    //| X (que ta sendo diminido pela metade do espaço da tela)  |
    //| y (mesma coisa)                                          |
    //| Largura maxima do espaço                                 |
    //| Altura maxima do espaço                                  |
    //|__________________________________________________________|
    // ( Só pra lembrar oq é cada coisa)
}

// for (const v of vs){
    // pont(tela(projecao(transa_Z(rotacao_xz(v, angulo), dz))));
    // }
    // _________________________________
    //| Desenha as vértices como pontos |
    //|_________________________________|

// ==========================================================
// 8. Loops principais de animação
// ==========================================================

function quadros(){
    //dz += 1*dt; 
    // _______________________________
    //| Distancia e aproxima o Objeto |
    //|_______________________________|

    angulo += direcao * Math.PI * dt;
    // ______________________________________
    //| Rotaciona e muda a direção do Obejto |
    //|______________________________________|


    limpar();
    
    for (const f of fs){
        for (let i = 0; i < f.length; ++i){
            const a = vs[f[i]];
            const b = vs[f[(i+1)%f.length]];
            const p1 = tela(projecao(transa_Z(rotacao_xz(a, angulo), dz)));
            const p2 = tela(projecao(transa_Z(rotacao_xz(b, angulo), dz)));
            linha(p1, p2);
        }
    // _________________________________________________________________
    //| Com isso ele vai pegar o array e fazer uma caminho entre eles   |
    //| começando no ( 0 > 1 | 1 > 2 ) e por ai vai ate chegar no final |
    //|_________________________________________________________________|
    }
    setTimeout(quadros, 1000/FPS);
    // __________________________________________________________
    //| Usando (DZ) ele esta fazendo uma pequena animação em     |
    //| quadros por segundos (FPS) distanciando todos os obejtos |
    //| com base na velocidade da passagem dos quadros (60)      |
    //|__________________________________________________________|
}

bntEsq.addEventListener("click", () => {
    direcao = -1;
})
bntDir.addEventListener("click", () => {
    direcao = 1;
})

quadros();