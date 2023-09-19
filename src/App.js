import './App.css';
import {useRef, useState} from "react";
import {arrayDims, attributes, cellAttrs, cellStyleVariants, rotateCtlAttrs} from "./utils/attrs";
import {Box, Container, Grid} from "@mui/material";
import {Board} from "./comp/Board";
import {MessageCenter} from "./comp/MessageCenter";
import {RotateCtl} from "./comp/RotateCtl";

function App() {

    const rotateQuad = (quadCells, clockwise) => {
        const newCells = cells.slice();
        console.log(`Rotating quad ${quadCells[0].qid} ${clockwise ? 'clockwise' : 'counter clockwise'}`);

        // array of coordinates associated with the quadCells such that the center element is the origin (0, 0)
        const coordinates = quadCells.map((cell, idx) => ({
                startX: (idx) => idx % attributes.quadAttrs.columns - 1,
                startY: (idx) => attributes.quadAttrs.columns - Math.floor(idx / attributes.quadAttrs.columns) - 2,
                endX: (idx) => (clockwise ? -1 : 1) * (attributes.quadAttrs.columns - Math.floor(idx / attributes.quadAttrs.columns) - 2),
                endY: (idx) => (clockwise ? 1 : -1) * (idx % attributes.quadAttrs.columns - 1),
                idx: idx
            })
        );
        coordinates.map(xyPair => quadCells.reduce((endCell, currCell, idx) =>
            (xyPair.startX(xyPair.idx) === xyPair.endX(idx) && xyPair.startY(xyPair.idx) === xyPair.endY(idx))
                ? currCell //add currCell on true, should happen once
                : endCell //accumulate nothing on false
        )).forEach((cell, idx) => { //swap each cell from its start location with the cell of its end location
            const [temp, tempIdx] = [newCells[cell.pos], newCells.indexOf(quadCells[idx])];
            newCells[cell.pos] = quadCells[idx];
            newCells[tempIdx] = temp;
        });
        return newCells.map(cell => { cell.pos = newCells.indexOf(cell); return cell; });
    }

    const cellsToQuadFormat = (cells, columns, rowLength) => { //returns an array of 4 3x3 cell quads
      const cellSlicer = (cells, nwest, neast, cellsWidth) => [ //slices 3x3 quads of cells
          ...cells.slice(nwest, neast + 1),
          ...cells.slice(nwest + cellsWidth, neast + cellsWidth + 1),
          ...cells.slice(nwest + 2 * cellsWidth, neast + 2 * cellsWidth + 1)
      ];
      return [
          cellSlicer(cells, 0, columns - 1, rowLength), //northwest section
          cellSlicer(cells, columns, rowLength - 1, rowLength), //northeast section
          cellSlicer(cells, columns * rowLength, columns * rowLength + columns - 1, rowLength), //southwest section
          cellSlicer(cells, columns * rowLength + columns, columns * rowLength + rowLength - 1, rowLength) //southeast section
      ]
    }

  const initializeCells = () => {
      const determineQuad = idx => {
          if (idx.toString().match(/^((0)|(1)|(2)|(6)|(7)|(8)|(12)|(13)|(14))$/)) return 1;
          if (idx.toString().match(/^((3)|(4)|(5)|(9)|(10)|(11)|(15)|(16)|(17))$/)) return 2;
          if (idx.toString().match(/^((18)|(19)|(20)|(24)|(25)|(26)|(30)|(31)|(32))$/)) return 3;
          if (idx.toString().match(/^((21)|(22)|(23)|(27)|(28)|(29)|(33)|(34)|(35))$/)) return 4;
      }
      return new Array(arrayDims.x * arrayDims.y).fill({ ...cellAttrs })
          .map((cell, idx) => ({ ...cellAttrs, cid: -1 * idx, qid: determineQuad(idx), pos: idx }));
  };

  const initializeQuads = () => cellsToQuadFormat(cells, attributes.quadAttrs.columns,
              attributes.boardAttrs.columns * attributes.quadAttrs.columns);

  const initializeSelectors = () => new Array(4).fill({backgroundColor: '#00000000'});



  const [message, setMessage] = useState({ // message displayed in MessageCenter
      text: 'Welcome to Pentago! It is Player 1\'s turn',
      color: cellStyleVariants.win.color
  });
  const [turnState, setTurnState] = useState({ // set of bools defining the state of the game
      goPl1: true,
      selectQuad: false,
      doRotate: false
  });
  const [selectors, setSelectors] = useState(initializeSelectors); // React component for highlighting quad choices
  const [cells, setCells] = useState(initializeCells); // Data for tracking all 6x6 cells, must update to affect state
  const [quads, setQuads] = useState(initializeQuads); // Data for tracking 3x3 quads of cells within the cells array, must update to affect state
  const inputRef = useRef(null); // Reference for enabling keyboard input at all times

  const onClickQuadHandler = (quadCells, qid) => { //quadCells are an array of 9 objects whose 'cid' key corresponds
                                                    //to the index of that element within the cells array
      console.log(`Clicked on quad ${qid}!`);

      if (turnState.selectQuad) {
          if (selectors[qid - 1].backgroundColor === '#00000000') {
              const newSelectors = selectors.map((selector, idx) => idx === qid - 1
                  ? { backgroundColor: '#e4741d' }
                  : { backgroundColor: '#00000000' });
              setMessage({ text: `Quad ${qid}?`, color: message.color });
              setSelectors(newSelectors);
          }
          else {
              setTurnState({goPl1: turnState.goPl1, selectQuad: false, doRotate: true});
              setMessage({ text: 'Rotate! Choose a direction', color: message.color });
          }
      }
      else if (turnState.doRotate) {
          const newCells = rotateQuad(quadCells, !message.text.match(/(Counter Clockwise\?)$/));
          const newSelectors = selectors.slice();
          const newMessage = turnState.goPl1
              ? { text: 'Player 1\'s turn!', color: cellStyleVariants.firstPl.color }
              : { text: 'Player 2\'s turn!', color: cellStyleVariants.secondPl.color };
          newSelectors[qid - 1].backgroundColor = '#00000000';

          setTurnState({ goPl1: turnState.goPl1, selectQuad: false, doRotate: false });
          setMessage(newMessage);
          setSelectors(newSelectors);
          setQuads(cellsToQuadFormat(newCells, attributes.quadAttrs.columns, quads[qid - 1].length));
          setCells(newCells);
      }
  };

  const onClickCellHandler = (pos, qid) => {
      if (!turnState.doRotate && !turnState.selectQuad) {
          const newCells = cells.slice();
          let newMessage = message;

          if (turnState.goPl1) {
              newCells[pos] = {
                  ...cells[pos],
                  style: cellStyleVariants.firstPl,
                  cid: -1 * cells[pos].cid
              };
              newMessage = { text: 'Player 1, choose a quad', color: cellStyleVariants.firstPl.color };
          } else {
              newCells[pos] = {
                  ...cells[pos],
                  style: cellStyleVariants.secondPl,
                  cid: -1 * cells[pos].cid
              };
              newMessage = { text: 'Player 2, choose a quad', color: cellStyleVariants.secondPl.color };
          }

          setMessage(newMessage);
          setTurnState({ goPl1: !turnState.goPl1, selectQuad: true, doRotate: false });
          setQuads(cellsToQuadFormat(newCells, attributes.quadAttrs.columns, quads[qid - 1].length));
          setCells(newCells);
      }
  };

  const onClickRCTL = (key) => {
      if (turnState.doRotate) {
          if (key.match(/^(counter-clockwise)$/))
              setMessage({text: 'Rotate!\nCounter Clockwise?', color: message.color});
          if (key.match(/^(clockwise)$/))
              setMessage({text: 'Rotate!\nClockwise?', color: message.color});
      }
  }

  const onKeyDownHandler = (event, callbackQuads) => {
      const key = event.key;
      const qid = callbackQuads[0].qid;

      if (!turnState.doRotate && !turnState.selectQuad) {
          const newCells = cells.slice();
          const selectIdx = callbackQuads.flat()
              .reduce((targetIdx, cell, idx) =>
                  targetIdx + (cell.cid < 0
                      && cells[idx].qid === qid
                      && cell.backgroundColor !== cellStyleVariants.empty
                          ? cell.pos : 0), 0);

          if (!cells.find(cell =>
                cell.style === (turnState.goPl1 ? cellStyleVariants.firstPl : cellStyleVariants.secondPl))) {
              const start = Math.floor(Math.random() * cells.length);
              newCells[start] = {
                  ...cells[start],
                  style: cellStyleVariants.firstPl
              };
              setCells(newCells);
          }
          else {
              if (key.match(/^(ArrowUp|w)$/)) {
                  newCells[selectIdx - (selectIdx - arrayDims.x >= 0 ? arrayDims.x : 0)] = {
                      ...cells[selectIdx - (selectIdx - arrayDims.x >= 0 ? arrayDims.x : 0)],
                      style: turnState.goPl1 ? cellStyleVariants.firstPl : cellStyleVariants.secondPl
                  };
                  if (selectIdx - arrayDims.x >= 0)
                      newCells[selectIdx] = { ...cells[selectIdx], style: cellStyleVariants.empty }
              }
              if (key.match(/^(ArrowDown|s)$/)) {
                  newCells[selectIdx + (selectIdx + arrayDims.x >= 0 ? arrayDims.x : 0)] = {
                      ...cells[selectIdx + (selectIdx + arrayDims.x >= 0 ? arrayDims.x : 0)],
                      style: turnState.goPl1 ? cellStyleVariants.firstPl : cellStyleVariants.secondPl
                  };
                  if (selectIdx + arrayDims.x >= 0)
                      newCells[selectIdx] = { ...cells[selectIdx], style: cellStyleVariants.empty }
              }
              if (key.match(/^(ArrowLeft|a)$/)) {
                  newCells[selectIdx - (selectIdx % cells.length !== 0 && selectIdx - 1 >= 0 ? 1 : 0)] = {
                      ...cells[selectIdx - (selectIdx % cells.length !== 0 && selectIdx - 1 >= 0 ? 1 : 0)],
                      style: turnState.goPl1 ? cellStyleVariants.firstPl : cellStyleVariants.secondPl
                  };
                  if (selectIdx % cells.length !== 0 && selectIdx - 1 >= 0) //if the index is not currently on a left wall
                      newCells[selectIdx] = { ...cells[selectIdx], style: cellStyleVariants.empty }
              }
              if (key.match(/^(ArrowRight|d)$/)) {
                  newCells[selectIdx + ((selectIdx + 1) % cells.length !== 0 && selectIdx + 1 < cells.length ? 1 : 0)] = {
                      ...cells[selectIdx + ((selectIdx + 1) % cells.length !== 0 && selectIdx + 1 < cells.length ? 1 : 0)],
                      style: turnState.goPl1 ? cellStyleVariants.firstPl : cellStyleVariants.secondPl
                  };
                  if ((selectIdx + 1) % cells.length !== 0 && selectIdx + 1 < cells.length) //if the index is not currently on a right wall
                      newCells[selectIdx] = { ...cells[selectIdx], style: cellStyleVariants.empty }
              }
          }
          if (key.match(/^(Enter)$/)) {
              newCells[selectIdx] = {
                  ...cells[selectIdx],
                  style: turnState.goPl1 ? cellStyleVariants.firstPl : cellStyleVariants.secondPl,
                  cid: -1 * cells[selectIdx].cid
              }
              setTurnState({goPl1: turnState.goPl1, selectQuad: true, doRotate: false});
              setMessage(turnState.goPl1
                  ? {text: 'Player 1, choose a quad', color: message.color}
                  : {text: 'Player 2, choose a quad', color: message.color});
          }

      }
      else {
          const currIdx = selectors
              .reduce((targetIdx, s, idx) => targetIdx + (s.backgroundColor === '#e4741d' ? idx : 0), 0);
          const newSelectors = selectors.slice();

          if (turnState.selectQuad) {
              if (key.match(/^(ArrowUp|w)$/)) {
                  newSelectors[currIdx - (currIdx - 2 >= 0 ? 2 : 0)] = {backgroundColor: '#e4741d'};
                  setMessage({text: `Quad ${currIdx + 1 - (currIdx - 2 >= 0 ? 2 : 0)}?`, color: message.color});
                  if (currIdx - 2 >= 0)
                      newSelectors[currIdx] = {backgroundColor: '#00000000'};
              }
              if (key.match(/^(ArrowDown|s)$/)) {
                  newSelectors[currIdx + (currIdx + 2 < selectors.length ? 2 : 0)] = {backgroundColor: '#e4741d'};
                  setMessage({
                      text: `Quad ${currIdx + 1 + (currIdx + 2 < selectors.length ? 2 : 0)}?`,
                      color: message.color
                  });
                  if (currIdx + 2 < selectors.length)
                      newSelectors[currIdx] = {backgroundColor: '#00000000'};
              }
              if (key.match(/^(ArrowLeft|a)$/)) {
                  newSelectors[currIdx - (currIdx !== 2 && currIdx - 1 >= 0 ? 1 : 0)] = {backgroundColor: '#e4741d'};
                  setMessage({
                      text: `Quad ${currIdx + 1 - (currIdx !== 2 && currIdx - 1 >= 0 ? 1 : 0)}?`,
                      color: message.color
                  });
                  if (currIdx !== 2 && currIdx - 1 >= 0)
                      newSelectors[currIdx] = {backgroundColor: '#00000000'};
              }
              if (key.match(/^(ArrowRight|d)$/)) {
                  newSelectors[currIdx + (currIdx !== 1 && currIdx + 1 < selectors.length ? 1 : 0)] = {backgroundColor: '#e4741d'};
                  setMessage({
                      text: `Quad ${currIdx + 1 + (currIdx !== 1 && currIdx + 1 < selectors.length ? 1 : 0)}?`,
                      color: message.color
                  });
                  if (currIdx !== 1 && currIdx + 1 < selectors.length)
                      newSelectors[currIdx] = {backgroundColor: '#00000000'};
              }
              if (key.match(/^(Enter)$/)) {
                  setTurnState({goPl1: turnState.goPl1, selectQuad: false, doRotate: true});
                  setMessage({text: 'Rotate! Choose a direction', color: message.color});
              }
              setSelectors(newSelectors);
          }
          if (turnState.doRotate) {
              console.log(currIdx);
              if (key.match(/^(ArrowLeft|a)$/))
                  setMessage({text: 'Rotate!\nCounter Clockwise?', color: message.color});
              if (key.match(/^(ArrowRight|d)$/))
                  setMessage({text: 'Rotate!\nClockwise?', color: message.color});
              if (key.match(/^(Enter)$/)) {
                  const newCells = rotateQuad(callbackQuads[currIdx], !message.text.match(/(Counter Clockwise\?)$/));
                  newSelectors[currIdx].backgroundColor = '#00000000';

                  setSelectors(newSelectors);
                  setMessage(turnState.goPl1
                      ? {text: 'Player 1\'s turn!', color: cellStyleVariants.firstPl.color}
                      : {text: 'Player 2\'s turn!', color: cellStyleVariants.secondPl.color});
                  setTurnState({goPl1: turnState.goPl1, selectQuad: false, doRotate: false});
                  setQuads(cellsToQuadFormat(newCells, attributes.quadAttrs.columns, callbackQuads[currIdx].length));
                  setCells(newCells);
              }
          }
      }
  };

  const onBlurHandler = (event) => inputRef.current.focus();



  return (
    <Container
        sx={{
            width: 4320,
            height: 910,
            backgroundColor: '#10456d'
        }}
    >
        <Grid container
              direction='column'
              alignItems='center'
              justifyContent='center'
              spacing={2}
        >
            <Grid item xs={2}>
                <Box sx={{ pt: 10 }}/>
            </Grid>
            <Grid item xs={2}>
                <MessageCenter message={message}/>
            </Grid>
            <Grid item xs={7}>
                <Board attrs={attributes}
                       cells={initializeCells()}
                       quads={initializeQuads()}
                       selectors={selectors ? selectors : initializeSelectors()}
                       handlers={{ onClickQuadHandler: onClickQuadHandler, onClickCellHandler: onClickCellHandler,
                                onKeyDownHandler: onKeyDownHandler, onBlurHandler: onBlurHandler }}
                       inputRef={inputRef}
                />
            </Grid>
            <Grid item xs={1}>
                <RotateCtl attrs={rotateCtlAttrs} onClickHandler={onClickRCTL}/>
            </Grid>
        </Grid>
    </Container>
  );
}

export default App;
