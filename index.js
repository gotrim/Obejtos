console.log(base);

base.width = 800;
base.height = 800;
const con = base.getContext("2d");
console.log(con);
con.fillStyle = "blue";
con.fillRect(0,0,100,100);