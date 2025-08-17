import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowPointer, faArrowRightLong, faCircle, faPen, faRotateLeft, faRotateRight, faRulerHorizontal, faRulerVertical, faSlash, faT, faTrash, faVectorPolygon } from '@fortawesome/free-solid-svg-icons';

const Btn = ({active, onClick, title, icon}) => (
  <button
    title={title}
    onClick={onClick}
    className={`px-2 cursor-pointer py-1 rounded ${active ? 'bg-[var(--color-InputLine)]!' : 'bg-[var(--color-Input)]! hover:bg-[var(--color-InputLine)]!'}`}
  >
    <FontAwesomeIcon icon={icon}/>
  </button>
);

export default function DrawingToolbar({
  tool, setTool, onDelete, onUndo, onRedo
}) {

  return (
    <div className="flex gap-3 flex-col h-full bg-[var(--color-ChartBg)] p-2 rounded-r-lg shadow-lg border border-[var(--color-Line)]">
      <Btn title="Select/Move"      icon={faArrowPointer}   active={tool==='select'} onClick={()=>setTool('select')}/>
      <Btn title="Trendline"        icon={faSlash}          active={tool==='segment'} onClick={()=>setTool('segment')}/>
      <Btn title="Ray (kéo về bên phải)" icon={faArrowRightLong} active={tool==='ray'} onClick={()=>setTool('ray')}/>
      <Btn title="Horizontal line"  icon={faRulerHorizontal}active={tool==='hline'} onClick={()=>setTool('hline')}/>
      <Btn title="Vertical line"    icon={faRulerVertical}  active={tool==='vline'} onClick={()=>setTool('vline')}/>
      <Btn title="Rectangle"        icon={faVectorPolygon}   active={tool==='rect'} onClick={()=>setTool('rect')}/>
      <Btn title="Ellipse"          icon={faCircle}         active={tool==='ellipse'} onClick={()=>setTool('ellipse')}/>
      <Btn title="Brush"            icon={faPen}            active={tool==='brush'} onClick={()=>setTool('brush')}/>
      <Btn title="Text"             icon={faT}              active={tool==='text'} onClick={()=>setTool('text')}/>
      <div className="h-[1px] bg-gray-600 my-2"/>
      <Btn title="Undo"             icon={faRotateLeft}     onClick={onUndo}/>
      <Btn title="Redo"             icon={faRotateRight}    onClick={onRedo}/>
      <Btn title="Delete"           icon={faTrash}          onClick={onDelete}/>
    </div>
  );
}