// ==========================================================
// 1. Obtém os elementos do DOM após o carregamento da página
// ==========================================================
const base = document.getElementById("base");
console.log(base);
if (!base) {
    console.error("Canvas não encontrado");
    throw new Error("Canvas ausente");
}

base.width = 400;
base.height = 400;
    // ___________________
    //| Tamanho do canvas |
    //|___________________|

// ==========================================================
// 2. Elementos de controle (botões)
// ==========================================================
const bntEsq = document.getElementById("bntEsq");
const bntDir = document.getElementById("bntDir");
const bntCim = document.getElementById("bntCim");
const bntBai = document.getElementById("bntBai");
const bntPara = document.getElementById("bntPara");
const bntVertices = document.getElementById("bntVertices");

if (!bntDir || !bntEsq || !bntBai || !bntCim || !bntPara || !bntVertices) {
    console.error("Botões não encontrados");
}

// ==========================================================
// 3. Contexto de desenho e variáveis globais
// ==========================================================
const con = base.getContext("2d");
    //                         _______________________________________________________________
const FPS = 30;             //|Quadros por segundo                                            |
const dt = 1 / FPS;         //|Intervalo de tempo entre quadros                               |
const passo = Math.PI / 10; //|Passo de rotação manual (18°)                                  |
const Zoom = 0.2;           //|Passo de zoom                                                  |
const minDz = 0.2;          //|Distância mínima da câmera                                     |
const maxDz = 5;            //|Distância máxima da câmera                                     |
    //                        |---------------------------------------------------------------|
let dz = 1;                 //| Distância da câmera (ajusta o tamanho aparente do objeto)     |
let angulo = 0;             //| Ângulo atual de rotação (em radianos)                         |
let direcao = 1;            //| 1 = horário, -1 = anti-horário, 0 = parado                    |
let ultimaDirecao = 1;      //| Última direção ativa (para quando a pausa é desligada)        |
let pausa = false;          //| Controla se a animação de rotação está pausada                |
let mostrarVertices = true; //| Exibe ou oculta os vértices (pontos)                          |
    //                        |_______________________________________________________________|

const fundo = "#1A1A1A";
const interior = "#8DB600";

// ==========================================================
// 4. Vértices do Objeto (coordenadas 3D)
// ==========================================================
const vs = [
    //                                    ___
    { x:  0.125, y:      0, z:  0.25 },//| 0 |
    { x: -0.125, y:      0, z:  0.25 },//| 1 |
    { x: -0.062, y: -0.125, z:  0.25 },//| 2 |
    { x:  0.062, y: -0.125, z:  0.25 },//| 3 |
    { x:      0, y:  0.125, z:  0.25 },//| 4 |
    //                                   |---|
    { x:  0.125, y:      0, z: -0.25 },//| 5 |
    { x: -0.125, y:      0, z: -0.25 },//| 6 |
    { x: -0.062, y: -0.125, z: -0.25 },//| 7 |
    { x:  0.062, y: -0.125, z: -0.25 },//| 8 |
    { x:      0, y:  0.125, z: -0.25 },//| 9 |
    //                                   |___|
];

// ==========================================================
// 5. Arestas (índices dos vértices para formar as linhas)
// ==========================================================
const fs = [
    [0, 4], [4, 1], [1, 2], [2, 3], [3, 0],
    [5, 9], [9, 6], [6, 7], [7, 8], [8, 5],
    [0, 5], [4, 9], [1, 6], [2, 7], [3, 8],
];

    // __________________________________________________________________________
    //| O objeto é um prisma de base pentagonal (meio losango) com 10 vértices. |
    //| As arestas definem as conexões entre eles, formando um sólido 3D.       |
    //|__________________________________________________________________________|

// ==========================================================
// 6. Funções auxiliares (geometria)
// ==========================================================
function rotacao_xz({ x, y, z }, angulo) {
    const c = Math.cos(angulo);
    const s = Math.sin(angulo);
    return {
        x: x * c - z * s,
        y: y,
        z: x * s + z * c,
    };
    // __________________________________________
    //| Rotação no plano XZ (em torno do eixo Y) |
    //|__________________________________________|
}

function transa_Z({ x, y, z }, dz) {
    return { x, y, z: z + dz };
    // _____________________________________
    //| Translação em Z (afastar/aproximar) |
    //|_____________________________________|
}

function projecao({ x, y, z }) {
    //                                 __________________________________________________
    //                                | Projeção perspectiva simples: divide x e y por z |
    //                                | Quanto menor z, maior o objeto parece            |
    const zv = z === 0 ? 0.001 : z; //|--------------------------------------------------|
    return {//                        | Evita divisão por zero                           |
        x: x / zv,//                  |__________________________________________________|
        y: y / zv,
    };
    // ______________________________
    //| Projeção perspectiva simples |
    //|______________________________|
}

function tela(p) {
    // __________________________________________________________________
    //| Converte coordenadas normalizadas (-1 a 1) para pixels no canvas |
    //| A fórmula (p + 1)/2 transforma o intervalo [-1,1] em [0,1]       |
    //| Depois multiplica pela largura/altura do canvas                  |
    //|__________________________________________________________________|
    return {
        x: (p.x + 1) / 2 * base.width,
        y: (p.y + 1) / 2 * base.height,
    };
    // _________________________________________________________
    //| Normaliza as coordenadas para o espaço da tela (pixels) |
    //|_________________________________________________________|
}

// ==========================================================
// 7. Funções de desenho
// ==========================================================
function limpar() {
    con.fillStyle = fundo;
    con.fillRect(0, 0, base.width, base.height);
    // ________________________
    //| Limpa o canvas (fundo) |
    //|________________________|
}

function linha(p1, p2) {
    con.strokeStyle = interior;
    con.beginPath();
    con.moveTo(p1.x, p1.y);
    con.lineTo(p2.x, p2.y);
    con.stroke();
}

function pont({ x, y }) {
    const a = 10;
    con.fillStyle = interior;
    con.fillRect(x - a / 2, y - a / 2, a, a);
    // ____________________________________________________________
    //| Desenha um pequeno quadrado centralizado em (x, y)          |
    //|____________________________________________________________|
}

// ==========================================================
// 8. Loop principal de animação
// ==========================================================
function quadros() {

    angulo += direcao * Math.PI * dt;
    // ____________________________________________
    //| Aplica a rotação contínua (se não pausado) |
    //|____________________________________________|

    limpar();

    for (const f of fs) {
        for (let i = 0; i < f.length; ++i) {

            const a = vs[f[i]];
            const b = vs[f[(i + 1) % f.length]];
            const p1 = tela(projecao(transa_Z(rotacao_xz(a, angulo), dz)));
            const p2 = tela(projecao(transa_Z(rotacao_xz(b, angulo), dz)));
            
            linha(p1, p2);
        }
        // _________________________________________________________________
        //| Percorre cada aresta e desenha o segmento entre seus vértices   |
        //|_________________________________________________________________|
    }

    // Desenha os vértices (pontos) se a opção estiver ativada
    if (mostrarVertices) {
        for (const v of vs) {
            const p = tela(projecao(transa_Z(rotacao_xz(v, angulo), dz)));
            pont(p);
        }
    }

    setTimeout(quadros, 1000 / FPS);
    // __________________________________________________________
    //| Chama a si mesma a cada intervalo, criando o loop        |
    //| de animação baseado em FPS.                              |
    //|__________________________________________________________|
}

// ==========================================================
// 9. Eventos dos botões
// ==========================================================
bntEsq.addEventListener("click", () => {
    ultimaDirecao = -1;
        if (pausa) {
        angulo -= passo;
    } else {
        direcao = -1;
    }
});

bntDir.addEventListener("click", () => {
    ultimaDirecao = 1;
    if (pausa) {
        angulo += passo;
    } else {
        direcao = 1;
    }
});

bntCim.addEventListener("click", () => {
    dz = Math.max(dz - Zoom, minDz);
});

bntBai.addEventListener("click", () => {
    dz = Math.min(dz + Zoom, maxDz);
});

bntPara.addEventListener("click", () => {
    //                               _____________________________
    pausa = !pausa;               //| Alterna o estado de pausa   |
    if (pausa) {//                  |-----------------------------|
        direcao = 0;              //| Para a rotação automática   |
        bntPara.textContent = "▸";//| Ícone de "play"             |
    } else {//                      |-----------------------------|
        direcao = ultimaDirecao;  //| Retoma com a última direção |
        bntPara.textContent = "⏸";//| Ícone de "pause"            |
    }//                           //|_____________________________|
});

bntVertices.addEventListener("click", () => { //             _________________________________
    mostrarVertices = !mostrarVertices;                   //| Alterna visibilidade dos pontos |
    bntVertices.textContent = mostrarVertices ? "◉" : "○";//| Muda ícone                      |
}); //                                                      |_________________________________|

// ==========================================================
// 10. Inicia a animação
// ==========================================================
quadros();