import React, { useEffect, useRef, useState } from 'react';
import DrawingToolbar from './DrawingToolBar';
import { Circle, Group, Layer, Line, Rect, Stage, Text } from 'react-konva';

/**
 * Shapes được lưu dưới dạng toạ độ logic:
 *  - time: UTCTimestamp (seconds) theo lightweight-charts
 *  - price: number
 * Ta convert qua lại pixel <-> logic bằng API của chart.
 */

const TOOL_CURSOR   = 'select';
const TOOL_SEGMENT  = 'segment';
const TOOL_RAY      = 'ray';
const TOOL_HLINE    = 'hline';
const TOOL_VLINE    = 'vline';
const TOOL_RECT     = 'rect';
const TOOL_ELLIPSE  = 'ellipse';
const TOOL_BRUSH    = 'brush';
const TOOL_TEXT     = 'text';

const stroke = '#facc15';    // vàng chanh để dễ nhìn
const strokeSel = '#60a5fa'; // xanh lam khi select

export default function DrawingLayer({
  chart,               // chart instance từ lightweight-charts
  series,              // series đang hiển thị (để lấy priceScale)
  containerRef,        // ref đến div chart (để biết width/height hiện tại)
}) {
  const [tool, setTool] = useState(TOOL_CURSOR);
  const [shapes, setShapes] = useState([]);     // {id, type, data, locked?}
  const [selectedId, setSelectedId] = useState(null);
  const [draft, setDraft] = useState(null);     // đối tượng đang vẽ dở
  const [size, setSize]   = useState({w: 300, h: 300});
  const undoRef = useRef([]);  // stack
  const redoRef = useRef([]);

  // ===== helpers: mapping pixel <-> logic =====
  const toX = (t) => chart?.timeScale().timeToCoordinate(t);
  const fromX = (x) => {
    const r = chart?.timeScale().coordinateToTime(x);
    return typeof r === 'number'
      ? r
      : (r ? Date.UTC(r.year, r.month - 1, r.day) / 1000 : undefined);
  };

  const toY = (p) => series?.priceToCoordinate(p);
  const fromY = (y) => series?.coordinateToPrice(y);

  // cập nhật kích thước overlay khi chart resize
  useEffect(() => {
    const resize = () => {
      if (!containerRef.current) return;
      setSize({ w: containerRef.current.clientWidth, h: containerRef.current.clientHeight });
    };
    resize();
    //const unsub1 = chart?.timeScale().subscribeVisibleTimeRangeChange(resize);
    // fallback
    const ro = new ResizeObserver(resize);
    containerRef.current && ro.observe(containerRef.current);
    window.addEventListener('resize', resize);
    return () => {
      //unsub1 && chart?.timeScale().unsubscribeVisibleTimeRangeChange(resize);
      ro.disconnect();
      window.removeEventListener('resize', resize);
    };
  }, [chart, containerRef]);

  // ===== undo/redo helpers =====
  const pushUndo = (prev) => { undoRef.current.push(prev); redoRef.current = []; };
  const undo = () => {
    const prev = undoRef.current.pop(); if (!prev) return;
    redoRef.current.push(shapes); setShapes(prev);
  };
  const redo = () => {
    const nxt = redoRef.current.pop(); if (!nxt) return;
    undoRef.current.push(shapes); setShapes(nxt);
  };

  // ===== mouse handlers =====
  const onMouseDown = (e) => {
    const pos = e.target.getStage().getPointerPosition();
    if (!pos) return;
    const t = fromX(pos.x), p = fromY(pos.y);
    if (t == null || p == null) return;

    if (tool === TOOL_CURSOR) {
      setSelectedId(null);
      return;
    }

    const start = { t, p };
    let newDraft;

    switch (tool) {
      case TOOL_SEGMENT: newDraft = { type: TOOL_SEGMENT, a: start, b: start }; break;
      case TOOL_RAY:     newDraft = { type: TOOL_RAY,     a: start, b: start }; break;
      case TOOL_HLINE:   newDraft = { type: TOOL_HLINE,   p: start.p }; break;
      case TOOL_VLINE:   newDraft = { type: TOOL_VLINE,   t: start.t }; break;
      case TOOL_RECT:    newDraft = { type: TOOL_RECT,    a: start, b: start }; break;
      case TOOL_ELLIPSE: newDraft = { type: TOOL_ELLIPSE, a: start, b: start }; break;
      case TOOL_BRUSH:   newDraft = { type: TOOL_BRUSH,   points: [{t, p}] }; break;
      case TOOL_TEXT:    newDraft = { type: TOOL_TEXT,    at: start, text: '' }; break;
      default: return;
    }
    setDraft(newDraft);
  };

  const onMouseMove = (e) => {
    if (!draft) return;
    const pos = e.target.getStage().getPointerPosition();
    if (!pos) return;
    const t = fromX(pos.x), p = fromY(pos.y);
    if (t == null || p == null) return;

    setDraft(d => {
      if (!d) return d;
      const c = structuredClone(d);
      if (c.type === TOOL_SEGMENT || c.type === TOOL_RAY || c.type === TOOL_RECT || c.type === TOOL_ELLIPSE) c.b = { t, p };
      if (c.type === TOOL_BRUSH) c.points.push({ t, p });
      return c;
    });
  };

  const onMouseUp = () => {
    if (!draft) return;

    // nhập text nếu là TEXT
    if (draft.type === TOOL_TEXT) {
      const text = window.prompt('Nhập nội dung text:', 'Note');
      if (!text) { setDraft(null); return; }
      draft.text = text;
    }

    const newShape = { id: crypto.randomUUID(), ...draft };
    pushUndo(shapes);
    setShapes([...shapes, newShape]);
    setDraft(null);
    setSelectedId(newShape.id);
  };

  const deleteSelected = () => {
    if (!shapes.length) return;
    pushUndo(shapes);
    setShapes([]);        // clear toàn bộ
    setSelectedId(null);
  };

  // ===== utils render (logic -> pixel) =====
  const xy = (pt) => ({ x: toX(pt.t), y: toY(pt.p) });
  const linePixels = (a, b, type) => {
    const A = xy(a), B = xy(b);
    if (A.x==null || A.y==null || B.x==null || B.y==null) return null;

    if (type === TOOL_RAY) {
    if (Math.abs(B.x - A.x) < 1e-6) {
        // gần như vertical ray
        return [A.x, A.y, A.x, size.h];
      }
      const m = (B.y - A.y) / (B.x - A.x);
      const x2 = size.w;
      const y2 = A.y + m * (x2 - A.x);
      return [A.x, A.y, x2, y2];
    }
    return [A.x, A.y, B.x, B.y];
  };

  const renderShape = (s, isDraft=false) => {
    const common = { stroke: s.id===selectedId ? strokeSel : stroke, strokeWidth: 2, dash: isDraft ? [6,4] : undefined };

    switch (s.type) {
      case TOOL_SEGMENT: {
        const pts = linePixels(s.a, s.b, TOOL_SEGMENT); if (!pts) return null;
        return <Line key={s.id||'d-seg'} points={pts} {...common} />;
      }
      case TOOL_RAY: {
        const pts = linePixels(s.a, s.b, TOOL_RAY); if (!pts) return null;
        return <Line key={s.id||'d-ray'} points={pts} {...common} />;
      }
      case TOOL_HLINE: {
        const y = toY(s.p); if (y==null) return null;
        return <Line key={s.id||'d-h'} points={[0,y,size.w,y]} {...common} />;
      }
      case TOOL_VLINE: {
        const x = toX(s.t); if (x==null) return null;
        return <Line key={s.id||'d-v'} points={[x,0,x,size.h]} {...common} />;
      }
      case TOOL_RECT: {
        const A = xy(s.a), B = xy(s.b); if (!A.x||!A.y||!B.x||!B.y) return null;
        const x = Math.min(A.x,B.x), y = Math.min(A.y,B.y), w = Math.abs(B.x-A.x), h = Math.abs(B.y-A.y);
        return <Rect key={s.id||'d-r'} x={x} y={y} width={w} height={h} {...common} opacity={0.9} />;
      }
      case TOOL_ELLIPSE: {
        const A = xy(s.a), B = xy(s.b); if (!A.x||!A.y||!B.x||!B.y) return null;
        const x = (A.x + B.x)/2, y = (A.y + B.y)/2, rx = Math.abs(B.x-A.x)/2, ry = Math.abs(B.y-A.y)/2;
        return <Circle key={s.id||'d-e'} x={x} y={y} radius={Math.max(rx,ry)} scaleX={rx/Math.max(rx,ry)} scaleY={ry/Math.max(rx,ry)} {...common} />;
      }
      case TOOL_BRUSH: {
        const pts = s.points.map(pt => {
          const P = xy(pt); return [P.x, P.y];
        }).flat();
        if (pts.some(v => v==null)) return null;
        return <Line key={s.id||'d-b'} points={pts} tension={0.3} lineCap="round" lineJoin="round" {...common} />;
      }
      case TOOL_TEXT: {
        const P = xy(s.at); if (P.x==null||P.y==null) return null;
        return <Text key={s.id||'d-t'} x={P.x} y={P.y} text={s.text} fill={common.stroke} fontSize={14} />;
      }
      default: return null;
    }
  };

  return (
    <>
      {/* TOOLBAR nổi trên cùng, không bị Stage che */}
      <div className="absolute left-0 top-0 bottom-0 z-30">
        <DrawingToolbar
          tool={tool} setTool={setTool}
          onDelete={deleteSelected} onUndo={undo} onRedo={redo}
        />
      </div>

      {/* STAGE phủ khít chart container */}
      <Stage
        width={size.w}
        height={size.h}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        className="absolute inset-0 z-20"
        style={{ pointerEvents: tool === 'select' ? 'none' : 'auto' }}
      >
        <Layer>
          {shapes.map(s => (
            <Group key={s.id} onClick={()=> setSelectedId(s.id)}>
              {renderShape(s)}
            </Group>
          ))}
          {draft && renderShape(draft, true)}
        </Layer>
      </Stage>
    </>
  );
}
