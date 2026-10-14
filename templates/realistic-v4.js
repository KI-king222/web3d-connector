import * as THREE from "three";
import { bx, rb, cy, cable, fan, flatLabel } from "./components.js";

const M = (c, o = {}) => new THREE.MeshStandardMaterial({color:c, metalness:.45, roughness:.5, ...o});
const G = (c, i=.25) => M(c,{emissive:c, emissiveIntensity:i});
const gold=()=>M(0xc99532,{metalness:.95,roughness:.24});
const dark=()=>M(0x08090b,{metalness:.18,roughness:.75});
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
function label(g,text,w,h,x,y,z,rot=false){const l=flatLabel(text,w,h,{color:'#d8dce3',opacity:.68});l.position.set(x,y,z);if(rot)l.rotation.y=Math.PI/2;g.add(l);}
function screw(g,x,y,z,scale=1){g.add(cy(2.3*scale,1.2*scale,gold(),x,y,z,16));}
function holes(g, xs, zs, y, material=dark()){for(const x of xs)for(const z of zs)g.add(cy(1.4,1.0,material,x,y,z,12));}

function gpu(tier, theme){
 const g=new THREE.Group(), t=clamp(tier,1,10), L=304+(t-7)*6, H=137+(t-7)*2, T=t<=3?40:t<=7?52:61;
 const pcb=M(0x11151a), body=M(t>=8?0x4a4d52:0x24272c,{metalness:.68,roughness:.34}), edge=M(0x969ba1,{metalness:.9,roughness:.25});
 g.add(rb(L,2.2,H-8,pcb,2,0,1,0));
 // FE-like split-flow shell: two metal plates with a central open air channel.
 g.add(rb(L-10,T*.46,H,body,4,0,4+T*.25,-H*.27));
 g.add(rb(L-10,T*.46,H,body,4,0,4+T*.25,H*.27));
 const n=t<=2?2:t<=6?2:3, size=Math.min(92,(L-28)/n), z=0;
 for(let i=0;i<n;i++){
  const x=(i-(n-1)/2)*size;
  g.add(cy(size*.47,2.0,dark(),x,T+1,z,48));
  const ring=new THREE.Mesh(new THREE.TorusGeometry(size*.43,1.6,10,48),G(t>=7?0xffffff:0x818993,t>=7?.45:.1)); ring.rotation.x=Math.PI/2;ring.position.set(x,T+2,z);g.add(ring);
  const rotor=fan(size-7,{body:t>=8?0x5d626a:0x111217,accent:0xffffff},9,t>=8?11:9);rotor.position.set(x,T+3,z);g.add(rotor);
  screw(g,x-size*.35,T+2,z-size*.35,.65);screw(g,x+size*.35,T+2,z+size*.35,.65);
 }
 // fin stacks and end-flow openings
 const finMat=M(0xb5bbc1,{metalness:.85,roughness:.34});
 for(let i=0;i<38;i++)g.add(bx(.75,T*.42,H-18,finMat,-L/2+18+i*(L-36)/37,4+T*.24,0));
 g.add(rb(L-18,1.8,H-6,edge,1,0,2,-H*.49));
 for(let i=0;i<12;i++)g.add(bx(3,.7,H*.3,dark(),-L*.42+i*9,3,H*.34));
 // recessed 16-pin socket and top cover
 g.add(rb(25,9,13,dark(),2,L/2-38,T/2+3,0));
 g.add(bx(22,.9,11,gold(),L/2-38,T/2+8,0));
 // two-slot I/O bracket with 3 DP + HDMI cutouts
 g.add(bx(2,T,H-2,edge,.5,4,-L/2+1,0));
 for(let i=0;i<4;i++)g.add(bx(2.5,T*.28,12,dark(),-1,4,-L/2+1,-H*.32+i*22));
 label(g,t>=8?"GEFORCE RTX 5090":"HASHPOOL GPU",Math.min(100,L*.32),10,0,T/2+8,H/2+.4);
 for(const x of [-L/2+10,L/2-10])for(const z of [-H/2+10,H/2-10])screw(g,x,3,z,.8);
 g.userData.dims={L,H,T};return g;
}
function cpu(tier){
 const t=clamp(tier,1,10),g=new THREE.Group(),S=40,I=22+t*2.2;
 g.add(rb(S,1.2,S,M(t<4?0x183b26:0x1b251f,{roughness:.7}),.5,0,.7,0));
 g.add(rb(I,1.8,I,M(t<4?0x7d838a:0xc4c8ce,{metalness:.72,roughness:.28}),1.2,0,2.1,0));
 // AM5 is LGA: flat lands on underside, not pins on the CPU package.
 for(let x=-16;x<=16;x+=4)for(let z=-16;z<=16;z+=4)g.add(bx(1.6,.22,1.6,gold(),x,.12,z));
 const l=flatLabel(t>=8?`RYZEN 7 ${t===10?'9800X3D':'9700X'}`:'HASHPOOL AM5',I*.78,4,{color:'#34383e',opacity:.8});l.position.set(0,3.05,0);g.add(l);return g;
}
function motherboard(tier){
 const t=clamp(tier,1,10),g=new THREE.Group(),L=305,W=244,top=1.6,pcb=M(t>=8?0x12151a:0x1d3426,{roughness:.68}), alu=M(t>=7?0x2f3339:0x20242a,{metalness:.7,roughness:.34});
 g.add(rb(L,1.6,W,pcb,2,0,.8,0));
 // Real ATX zoning: rear I/O upper edge, AM5 socket, DIMM right, PCIe centre, storage covers.
 const sx=-48,sz=24;
 g.add(rb(57,3,57,dark(),2,sx,top+1.6,sz),rb(47,2,47,M(0x9ba1a6,{metalness:.78}),1,sx,top+3.2,sz));
 for(let i=0;i<4;i++){const x=25+i*14;g.add(bx(6,11,148,dark(),x,top+5,42));g.add(bx(4,1.5,142,M(0x171b22),x,top+11,42));}
 for(let i=0;i<4;i++){const z=-62-i*28;g.add(bx(135,10,7,dark(),-42,top+5,z));g.add(bx(128,1.4,5,alu,-42,top+11,z));}
 // VRM heatsinks, I/O shroud, M.2 covers, Q-release and CMOS battery.
 g.add(rb(78,19,18,alu,2,-83,top+10,105),rb(22,24,94,alu,2,-92,top+12,42));
 g.add(rb(102,22,7,dark(),-100,top+12,119),bx(70,1,2,G(0x5b6f86,.18),-100,top+23,119));
 for(const x of [-26,18,62])g.add(rb(62,5,22,alu,2,x,top+5,-12));
 g.add(rb(76,5,50,alu,2,42,top+5,-70));
 g.add(bx(8,12,34,dark(),L/2-8,top+6,25));
 for(let i=0;i<4;i++)g.add(bx(18,6,6,dark(),L/2-22,top+4,-38-i*12));
 // Rear I/O bank with mixed Type-A/Type-C, LAN and audio apertures.
 g.add(bx(8,25,W-12,dark(),-L/2+2,top+13,0));
 for(let i=0;i<8;i++)g.add(bx(3,7,12,i<2?M(0x8b99a5,{metalness:.8}):dark(),-L/2-2,top+8+(i%2)*12,-82+i*23));
 for(let i=0;i<10;i++)g.add(bx(5,1,4,gold(),-L/2+18+i*8,top+2,-W/2+18));
 g.add(cy(10,3,M(0xd0d4da,{metalness:.9}),35,top+4,-90,32));
 holes(g,[-130,130],[-94,94],top+1);label(g,t>=8?'ROG-STYLE X870E':'HASHPOOL ATX',86,9,55,top+2,91);
 return g;
}
function ram(tier){const t=clamp(tier,1,10),g=new THREE.Group(),h=32+Math.min(3,t*.3),body=M(t>=7?0x2e3238:0x15181c,{metalness:.52,roughness:.4});g.add(bx(135,1.4,1.2,M(0x17351f),0,.7,0),rb(135,7,3,body,1.2,0,h/2,2.6),rb(135,7,3,body,1.2,0,h/2,-2.6));for(let i=0;i<36;i++)g.add(bx(2.2,1.2,1,gold(),-65+i*3.7,0,0));for(let i=0;i<6;i++)g.add(bx(10,1,7,dark(),-48+i*20,h/2,0));g.add(bx(122,2,1.2,G(t>=8?0xffffff:0x44505c,t>=8?.3:.05),0,h+3,0));return g;}
function cooler(tier){const t=clamp(tier,1,10),g=new THREE.Group(),fin=M(0xb7bcc1,{metalness:.82,roughness:.36}),base=M(0xc1c7cc,{metalness:.9,roughness:.24});g.add(rb(46,6,52,M(0xa66b3b,{metalness:.8}),1,0,3,0));for(let tower of [-34,34]){for(let i=0;i<29;i++)g.add(bx(.8,112,54,fin,tower+i*2.4-34,70,0));}for(let z=-24;z<=24;z+=12)g.add(cy(3,140,M(0x9fa7ad,{metalness:.9}),0,72,z,12));for(const x of [-38,38]){const f=fan(140,{body:0x9b6949,accent:0x6b3b27},8,9);f.rotation.z=Math.PI/2;f.position.set(x,70,0);g.add(f);}g.add(bx(10,2,52,base,0,8,0));return g;}
function aio(tier){const g=new THREE.Group(),rad=M(0x252a30,{metalness:.64,roughness:.46});g.add(rb(398,38,120,rad,3,170,30,0));for(let x=35;x<=305;x+=135){const f=fan(112,{body:0x15171b,accent:0x7e8790},8,9);f.position.set(x,52,0);g.add(f);}g.add(cy(37,38,dark(),-92,28,0,48),cy(29,2,G(0x8ea4b7,.18),-92,48,0,48));for(const z of [-16,16])g.add(cable([[-55,28,z],[-5,28,z*1.5],[105,30,z]],0x111216,6));return g;}
function psu(tier){const g=new THREE.Group();g.add(rb(150,86,160,M(0x14171b,{metalness:.65,roughness:.45}),3,0,43,0));const f=fan(120,{body:0x101217,accent:0x4e5964},5,9);f.position.set(0,88,0);g.add(f);for(let i=0;i<14;i++)g.add(bx(14,7,2,dark(),-55+(i%7)*18,20+Math.floor(i/7)*24,81));g.add(bx(1,30,95,G(0x8eafc2,.12),76,43,0));return g;}
function ssd(tier){const g=new THREE.Group(),pcb=M(0x103c2a,{roughness:.68});g.add(rb(80,1.4,22,pcb,.7,0,.7,0));for(let i=0;i<5;i++)g.add(rb(10+i*2,1.5,9,dark(),-23+i*15,1.7,0,.6));for(let i=0;i<17;i++)g.add(bx(2.5,1,1,gold(),-39+i*2.5,.7,0));g.add(bx(52,.2,15,M(0x20262c,{roughness:.8}),4,2.6,0));return g;}
function fanV4(tier){const g=new THREE.Group(),frame=M(0xb8a98b,{roughness:.72}),rot=M(0x6f3e2d,{roughness:.58});g.add(rb(120,25,120,frame,5,0,12.5,0));const f=fan(110,{body:0x6f3e2d,accent:0x6f3e2d},8,9);f.position.y=26;g.add(f);for(const x of [-52,52])for(const z of [-52,52])screw(g,x,25,z,.75);return g;}
function caseV4(tier){
 const g=new THREE.Group(), W=215,H=469,D=447, steel=M(0xf0f0eb,{metalness:.42,roughness:.55}), wood=M(0x6b3c25,{roughness:.78}), mesh=M(0x24272b,{metalness:.25,roughness:.8});
 g.add(rb(W,3,D,steel,3,0,1.5,0),rb(W,3,D,steel,3,0,H-1.5,0));
 g.add(bx(W,H,3,steel,0,H/2,-D/2+1.5),bx(3,H,D,steel,W/2-1.5,H/2,0));
 g.add(bx(2,H-80,D-70,mesh, -W/2+1.5,H/2,0));
 for(let i=0;i<9;i++)g.add(rb(6,H-75,4,wood,1.2,-W/2-2,H/2,-D/2+38+i*42));
 g.add(bx(W-34,H-56,3,steel,0,H/2,D/2-1.5));
 g.add(bx(W-44,1.6,D-90,M(0x181a1e,{roughness:.76}),0,115,0));
 const f1=fan(120,{body:0x25282d,accent:0x596875},6,9);f1.rotation.x=Math.PI/2;f1.position.set(0,160,D/2-18);g.add(f1);
 const f2=fan(120,{body:0x25282d,accent:0x596875},6,9);f2.rotation.x=Math.PI/2;f2.position.set(0,300,D/2-18);g.add(f2);
 for(const x of [-42,-18,8])g.add(bx(10,5,2,dark(),x,H-18,D/2+1));
 return g;
}

export function buildV4(kind, tier=6){const t=Number(tier)||6;switch(kind){case 'v4_gpu':return gpu(t);case 'v4_cpu':return cpu(t);case 'v4_motherboard':return motherboard(t);case 'v4_ram':return ram(t);case 'v4_cooler':return cooler(t);case 'v4_aio':return aio(t);case 'v4_psu':return psu(t);case 'v4_ssd':return ssd(t);case 'v4_fan':return fanV4(t);case 'v4_case':return caseV4(t);default:return gpu(t);}}
