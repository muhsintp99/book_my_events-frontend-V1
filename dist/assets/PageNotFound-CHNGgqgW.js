import{t as m,u as f,r as x,j as t,s as r,B as n,T as l,L as h,d as b,v as i}from"./index-Bv9CUdV4.js";import{C as u}from"./Container-DoFpBeAz.js";/**
 * @license @tabler/icons-react v3.31.0 - MIT
 *
 * This source code is licensed under the MIT license.
 * See the LICENSE file in the root directory of this source tree.
 */var k=m("outline","arrow-left","IconArrowLeft",[["path",{d:"M5 12l14 0",key:"svg-0"}],["path",{d:"M5 12l6 6",key:"svg-1"}],["path",{d:"M5 12l6 -6",key:"svg-2"}]]);/**
 * @license @tabler/icons-react v3.31.0 - MIT
 *
 * This source code is licensed under the MIT license.
 * See the LICENSE file in the root directory of this source tree.
 */var y=m("outline","home","IconHome",[["path",{d:"M5 12l-2 0l9 -9l9 9l-2 0",key:"svg-0"}],["path",{d:"M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7",key:"svg-1"}],["path",{d:"M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6",key:"svg-2"}]]);const v=i`
    0%, 100% { 
      transform: translateY(0px) rotate(0deg); 
    }
    50% { 
      transform: translateY(-20px) rotate(180deg); 
    }
  `,w=i`
    0% {
      opacity: 0;
      transform: translateY(30px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  `,C=i`
    0%, 100% { transform: translate(0); }
    20% { transform: translate(-2px, 2px); }
    40% { transform: translate(-2px, -2px); }
    60% { transform: translate(2px, 2px); }
    80% { transform: translate(2px, -2px); }
  `,c=i`
    0%, 100% { opacity: 0.4; }
    50% { opacity: 0.8; }
  `;i`
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  `;const j=r(n)(({theme:e})=>({background:"linear-gradient(135deg, #667eea 0%, #764ba2 100%)",position:"relative",overflow:"hidden","&::before":{content:'""',position:"absolute",top:0,left:0,right:0,bottom:0,background:"linear-gradient(45deg, rgba(156, 39, 176, 0.3) 0%, rgba(63, 81, 181, 0.3) 100%)",zIndex:1}})),z=r(n)(({size:e,top:o,left:a,delay:d})=>({position:"absolute",width:`${e}px`,height:`${e}px`,backgroundColor:"rgba(255, 255, 255, 0.6)",borderRadius:"50%",top:`${o}%`,left:`${a}%`,animation:`${v} ${3+Math.random()*2}s ease-in-out infinite`,animationDelay:`${d}s`,zIndex:1})),I=r(l)(({theme:e})=>({fontFamily:"monospace",fontWeight:"bold",background:"linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #ffeaa7)",backgroundSize:"300% 300%",backgroundClip:"text",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",position:"relative",display:"inline-block",animation:`${C} 2s infinite`,textShadow:"0 0 30px rgba(255, 255, 255, 0.5)","&::before":{content:'"404"',position:"absolute",top:0,left:0,width:"100%",height:"100%",background:"linear-gradient(45deg, #ff6b6b, #4ecdc4)",backgroundClip:"text",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",animation:`${c} 1.5s infinite`,transform:"translate(-2px, -2px)",zIndex:-1},"&::after":{content:'"404"',position:"absolute",top:0,left:0,width:"100%",height:"100%",background:"linear-gradient(45deg, #45b7d1, #96ceb4)",backgroundClip:"text",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",animation:`${c} 1.5s infinite`,animationDelay:"0.1s",transform:"translate(2px, 2px)",zIndex:-2}})),s=r(n)(({delay:e=0})=>({animation:`${w} 0.8s ease-out forwards`,animationDelay:`${e}s`,opacity:0})),p=r(b)(({theme:e,variant:o})=>({borderRadius:"50px",padding:"12px 32px",fontSize:"1rem",fontWeight:600,textTransform:"none",position:"relative",overflow:"hidden",transition:"all 0.3s ease",...o==="primary"?{background:"linear-gradient(45deg, #667eea 0%, #764ba2 100%)",color:"white",border:"none",boxShadow:"0 4px 15px rgba(102, 126, 234, 0.4)","&:hover":{transform:"translateY(-2px)",boxShadow:"0 8px 25px rgba(102, 126, 234, 0.6)",background:"linear-gradient(45deg, #764ba2 0%, #667eea 100%)"}}:{background:"transparent",color:"white",border:"2px solid rgba(255, 255, 255, 0.8)","&:hover":{transform:"translateY(-2px)",backgroundColor:"rgba(255, 255, 255, 0.1)",borderColor:"white",boxShadow:"0 8px 25px rgba(255, 255, 255, 0.2)"}},"& .MuiButton-startIcon":{transition:"transform 0.3s ease"},"&:hover .MuiButton-startIcon":{transform:"translateX(-4px)"}})),M=()=>{f();const[e,o]=x.useState([]);return x.useEffect(()=>{const a=Array.from({length:15},(d,g)=>({id:g,size:Math.random()*4+2,top:Math.random()*100,left:Math.random()*100,delay:Math.random()*2}));o(a)},[]),t.jsxs(j,{children:[e.map(a=>t.jsx(z,{size:a.size,top:a.top,left:a.left,delay:a.delay},a.id)),t.jsx(u,{maxWidth:"md",sx:{position:"relative",zIndex:2},children:t.jsxs(n,{sx:{minHeight:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center"},children:[t.jsx(s,{children:t.jsx(I,{variant:"h1",sx:{fontSize:{xs:"6rem",sm:"8rem",md:"10rem"},mb:2},children:"404"})}),t.jsx(s,{delay:.2,children:t.jsx(l,{variant:"h4",component:"h2",sx:{color:"white",mb:2,fontWeight:300,fontSize:{xs:"1.5rem",sm:"2rem",md:"2.5rem"},background:"linear-gradient(45deg, #ffffff 0%, #f0f0f0 100%)",backgroundClip:"text",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"},children:"Page Not Found"})}),t.jsx(s,{delay:.4,children:t.jsx(l,{variant:"h6",sx:{color:"rgba(255, 255, 255, 0.9)",mb:6,maxWidth:"600px",lineHeight:1.6,fontSize:{xs:"1rem",sm:"1.1rem",md:"1.25rem"},fontWeight:300},children:"The page you're looking for seems to have drifted into the digital void. Don't worry though, even the best explorers sometimes take a wrong turn."})}),t.jsx(s,{delay:.6,children:t.jsxs(n,{sx:{display:"flex",flexDirection:{xs:"column",sm:"row"},gap:2,mb:8,alignItems:"center"},children:[t.jsx(p,{variant:"primary",size:"large",startIcon:t.jsx(k,{size:20}),onClick:()=>window.history.back(),children:"Go Back"}),t.jsx(p,{variant:"secondary",size:"large",startIcon:t.jsx(y,{size:20}),component:h,to:"/dashboard",children:"Home"})]})})]})})]})};export{M as default};
