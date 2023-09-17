import './App.css';
import {useRef, useState} from "react";
import {arrayDims, attributes, cellAttrs, cellStyleVariants} from "./utils/attrs";
import {Box, Container, Grid} from "@mui/material";
import {Board} from "./comp/Board";
import {MessageCenter} from "./comp/MessageCenter";

function App() {

    const rotateQuad = (quadCells, clockwise) => {
        const newCells = cells.slice();
        console.log(`Rotating quad ${quadCells[0].qid} ${clockwise ? 'clockwise' : 'counter clockwise'}`);
        const coordinates = quadCells.map((cell, idx) => ({
                startX: (idx) => idx % attributes.quadAttrs.columns - 1,
                startY: (idx) => attributes.quadAttrs.columns - Math.floor((idx / attributes.quadAttrs.columns)) - 2,
                endX: (idx) => (clockwise ? -1 : 1) * (attributes.quadAttrs.columns - Math.floor((idx / attributes.quadAttrs.columns)) - 2),
                endY: (idx) => (clockwise ? 1 : -1) * (idx % attributes.quadAttrs.columns - 1),
                idx: idx
            })
        );
        coordinates.map(xyPair => quadCells.reduce((endCell, currCell, idx) =>
            (xyPair.startX(xyPair.idx) === xyPair.endX(idx) && xyPair.startY(xyPair.idx) === xyPair.endY(idx))
                ? currCell //add currCell on true, should happen once
                : endCell //accumulate nothing on false
        ), {}).forEach((cell, idx) => {
            const [temp, tempIdx] = [newCells[cell.cid], newCells.indexOf(quadCells[idx])];
            newCells[cell.cid] = quadCells[idx];
            newCells[tempIdx] = temp;
        });
        return newCells;
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
          .map((cell, idx) => ({ ...cellAttrs, cid: idx, qid: determineQuad(idx) }));
  };

  const initializeQuads = () => cellsToQuadFormat(cells, attributes.quadAttrs.columns,
              attributes.boardAttrs.columns * attributes.quadAttrs.columns);



  const [message, setMessage] = useState({
      text: 'Welcome to Pentago! It is Player 1\'s turn',
      color: cellStyleVariants.win.color
  });
  const [turnState, setTurnState] = useState({
      goPl1: true,
      selectQuad: false,
      doRotate: false
  });
  const [selectors, setSelectors] = useState([ {backgroundColor: '#00000000'},
                                                                         {backgroundColor: '#00000000'},
                                                                         {backgroundColor: '#00000000'},
                                                                         {backgroundColor: '#00000000'} ]);
  const [cells, setCells] = useState(initializeCells);
  const [quads, setQuads] = useState(initializeQuads);
  const inputRef = useRef(null);

  const onClickQuadHandler = (quadCells, qid) => { //quadCells are an array of 9 objects whose 'cid' key corresponds
                                                    //to the index of that element within the cells array
      console.log(`Clicked on quad ${qid}!`);

      if (turnState.selectQuad) {
          if (selectors[qid - 1].backgroundColor === '#00000000') {
              const newSelectors = selectors.map((selector, idx) => idx === qid - 1
                  ? { backgroundColor: '#e4741d' }
                  : { backgroundColor: '#00000000' });
              setSelectors(newSelectors);
          }
          else {
              setTurnState({goPl1: turnState.goPl1, selectQuad: false, doRotate: true});
              setMessage({ text: 'Rotate!', color: message.color });
          }
      }
      else if (turnState.doRotate) {
          const newCells = rotateQuad(quadCells, false);
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

  const onClickCellHandler = (cid, qid, idx) => {
      console.log(`I am cell ${cid} of quadrant ${qid} and my index is ${idx}`);

      if (!turnState.doRotate && !turnState.selectQuad) {
          const newCells = cells.slice();
          let newMessage = message;

          if (turnState.goPl1) {
              newCells[cid] = {
                  ...cells[cid],
                  style: cellStyleVariants.firstPl
              };
              newMessage = { text: 'Player 2, choose a quad', color: cellStyleVariants.firstPl.color };
          } else {
              newCells[cid] = {
                  ...cells[cid],
                  style: cellStyleVariants.secondPl
              };
              newMessage = { text: 'Player 1, choose a quad', color: cellStyleVariants.secondPl.color };
          }

          setMessage(newMessage);
          setTurnState({ goPl1: !turnState.goPl1, selectQuad: true, doRotate: false });
          setQuads(cellsToQuadFormat(newCells, attributes.quadAttrs.columns, quads[qid - 1].length));
          setCells(newCells);
      }
  };

  const onKeyDownHandler = (event) => {
      const key = event.key;
      const currIdx = selectors.indexOf({ backgroundColor: '#e4741d' }) >= 0
          ? selectors.indexOf({ backgroundColor: '#00000000' }) : 0;
      const newSelectors = selectors.slice();

      if (turnState.selectQuad) {
          if (key.match(/^(ArrowUp|w)$/)) {
              newSelectors[currIdx - (currIdx - 2 >= 0 ? 2 : 0)] = {backgroundColor: '#e4741d'};
              if (currIdx - 2 >= 0) {
                  //console.log(`idx: ${currIdx - 2} ${JSON.stringify(newSelectors[currIdx - 2])}`);
                  newSelectors[currIdx] = {backgroundColor: '#00000000'}
              }
          }
          if (key.match(/^(ArrowDown|s)$/)) {
              newSelectors[currIdx + (currIdx + 2 < selectors.length ? 2 : 0)] = {backgroundColor: '#e4741d'};
              if (currIdx + 2 < selectors.length) {
                  //console.log(`idx: ${currIdx + 2} ${JSON.stringify(newSelectors[currIdx + 2])}`);
                  newSelectors[currIdx] = {backgroundColor: '#00000000'}
              }
          }
          if (key.match(/^(ArrowLeft|a)$/)) {
              newSelectors[currIdx - (currIdx - 1 >= 0 ? 1 : 0)] = {backgroundColor: '#e4741d'};
              if (currIdx - 1 >= 0) {
                  //console.log(`idx: ${currIdx - 1} ${JSON.stringify(newSelectors[currIdx - 1])}`);
                  newSelectors[currIdx] = {backgroundColor: '#00000000'}
              }
          }
          if (key.match(/^(ArrowRight|d)$/)) {
              newSelectors[currIdx + (currIdx + 1 < selectors.length ? 1 : 0)] = {backgroundColor: '#e4741d'};
              if (currIdx + 1 < selectors.length) {
                  //console.log(`idx: ${currIdx + 1} ${JSON.stringify(newSelectors[currIdx + 1])}`);
                  newSelectors[currIdx] = {backgroundColor: '#00000000'}
              }
          }
          setSelectors(newSelectors);
      }
      if (turnState.doRotate) {
          console.log(`currIdx = ${currIdx}, quads[currIdx] = ${JSON.stringify(quads[currIdx])}`)
          if (key.match(/^(ArrowLeft|a)$/)) {
              const newCells = rotateQuad(quads[currIdx], true);
              const newSelectors = selectors.slice();
              const newMessage = turnState.goPl1
                  ? { text: 'Player 1\'s turn!', color: cellStyleVariants.firstPl.color }
                  : { text: 'Player 2\'s turn!', color: cellStyleVariants.secondPl.color };

              newSelectors[currIdx].backgroundColor = '#00000000';
              setTurnState({ goPl1: turnState.goPl1, selectQuad: false, doRotate: false });
              setMessage(newMessage);
              setSelectors(newSelectors);
              setQuads(cellsToQuadFormat(newCells, attributes.quadAttrs.columns, quads[currIdx].length));
              setCells(newCells);
          }
          if (key.match(/^(ArrowRight|d)$/)) {
              const newCells = rotateQuad(quads[currIdx], false);
              const newSelectors = selectors.slice();
              const newMessage = turnState.goPl1
                  ? { text: 'Player 1\'s turn!', color: cellStyleVariants.firstPl.color }
                  : { text: 'Player 2\'s turn!', color: cellStyleVariants.secondPl.color };

              newSelectors[currIdx].backgroundColor = '#00000000';
              setTurnState({ goPl1: turnState.goPl1, selectQuad: false, doRotate: false });
              setMessage(newMessage);
              setSelectors(newSelectors);
              setQuads(cellsToQuadFormat(newCells, attributes.quadAttrs.columns, quads[currIdx].length));
              setCells(newCells);
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
            <Grid item xs={4}>
                <MessageCenter message={message}/>
            </Grid>
            <Grid item xs={6}>
                <Board attrs={attributes}
                       cells={initializeCells()}
                       quads={initializeQuads()}
                       selectors={selectors}
                       onClickQuadHandler={onClickQuadHandler}
                       onClickCellHandler={onClickCellHandler}
                       onKeyDownHandler={onKeyDownHandler}
                       onBlurHandler={onBlurHandler}
                       inputRef={inputRef}
                />
            </Grid>
        </Grid>
    </Container>
  );
}

export default App;
