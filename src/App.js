import './App.css';
import {useRef, useState} from "react";
import {arrayDims, attributes, cellAttrs, cellStyleVariants, rotateCtlAttrs} from "./utils/attrs";
import {Box, Container, Grid} from "@mui/material";
import {Board} from "./comp/Board";
import {MessageCenter} from "./comp/MessageCenter";
import {RotateCtl} from "./comp/RotateCtl";

function App() {

    const longestLine = cells => cells.reduce((longest, cell, idx) => {
        if (longest.length < 5) {
            const [up, down, left, right] = [-1 * arrayDims.x,
                                                      arrayDims.x,
                                                      -1, 1];
            const withinBounds = (index, diff) => index >= 0 && index < cells.length
                ? index : index + diff;

            for (let i = withinBounds(idx + up, -1 * up); i <= withinBounds(idx + down, -1 * down); i += down) {
                for (let j = withinBounds(i + left, -1 * left); j <= withinBounds(i + right, -1 * right); j += right) {
                    if (longest.length < 5 && cell.style !== cellStyleVariants.empty && cells[j] !== cell) {
                        const sequence = [ cell ];
                        let dir = 0;
                        while (cells[withinBounds(j + dir, -1 * dir)].style === sequence[sequence.length - 1].style
                        && cells[withinBounds(j + dir, -1 * dir)].pos !== sequence[sequence.length - 1].pos
                        && sequence.length < 5) {
                            sequence.push(cells[withinBounds(j + dir, -1 * dir)]);
                            dir += j - idx;
                        }
                        if (longest.length < sequence.length)
                            longest = sequence;
                    }
                }
            }
            return longest;
        }
        else return longest;
    }, []).filter((cell, idx, array) => idx === array.indexOf(cell));

    const rotateQuad = (quadCells, clockwise = true) => {
        const newCells = cells.slice();
        console.log(`Rotating quad ${quadCells[0].qid} ${clockwise ? 'clockwise' : 'counter clockwise'}`);

        // array of coordinates associated with the quadCells such that the center element is the origin (0, 0)
        const coordinates = quadCells.map((cell, idx) => ({
                startX: (idx) => idx % attributes.quadAttrs.columns - 1,
                startY: (idx) => attributes.quadAttrs.columns - Math.floor(idx / attributes.quadAttrs.columns) - 2,
                endX: (idx) => (clockwise ? -1 : 1) * (attributes.quadAttrs.columns - Math.floor(idx / attributes.quadAttrs.columns) - 2),
                endY: (idx) => (clockwise ? 1 : -1) * (idx % attributes.quadAttrs.columns - 1),
                ogIdx: idx
            })
        );
        coordinates.map(xyPath => quadCells.reduce((accum, currCell, endIdx) =>
            (xyPath.startX(xyPath.ogIdx) === xyPath.endX(endIdx) && xyPath.startY(xyPath.ogIdx) === xyPath.endY(endIdx))
                ? currCell //add currCell on true, should happen once
                : accum //accumulate nothing on false
        )).forEach((cell, idx) => { //swap each cell from its start location with the cell of its end location
            const [temp, tempIdx] = [newCells[cell.pos], newCells.indexOf(quadCells[idx])];
            newCells[cell.pos] = quadCells[idx];
            newCells[tempIdx] = temp;
        });
        // update the pos variable to persist index position across rotations
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
      color: cellStyleVariants.win.backgroundColor
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

      if (!turnState.selectQuad || !turnState.doRotate) {
          if (turnState.selectQuad) {
              if (selectors[qid - 1].backgroundColor === '#00000000') {
                  const newSelectors = selectors.map((selector, idx) => idx === qid - 1
                      ? {backgroundColor: '#e4741d'}
                      : {backgroundColor: '#00000000'});
                  setMessage({text: `Quad ${qid}?`, color: message.color});
                  setSelectors(newSelectors);
              }
              else {
                  setTurnState({goPl1: turnState.goPl1, selectQuad: false, doRotate: true});
                  setMessage({text: 'Rotate! Choose a direction', color: message.color});
              }
          }
          else if (turnState.doRotate) {
              const newCells = rotateQuad(quadCells, !message.text.match(/(Counter Clockwise\?)$/));
              const newSelectors = selectors.slice();
              newSelectors[qid - 1].backgroundColor = '#00000000';

              const biggestSequence = longestLine(newCells);
              if (biggestSequence.length === 5) {
                  const bigSeqPositions = biggestSequence.map(winCell => winCell.pos);
                  const highlightCells = newCells
                      .filter(cell => bigSeqPositions.includes(cell.pos));

                  newCells.forEach(cell => {
                      const hlCellIdx = highlightCells.indexOf(cell);
                      if (hlCellIdx >= 0)
                          newCells[highlightCells[hlCellIdx].pos].style = cellStyleVariants.win;
                  })

                  setMessage(newCells[biggestSequence[0].pos].style === cellStyleVariants.firstPl
                      ? { text: 'Congratulations! Player 1 wins!', color: cellStyleVariants.win.backgroundColor }
                      : { text: 'Congratulations! Player 2 wins!', color: cellStyleVariants.win.backgroundColor });
                  setTurnState({ goPl1: turnState.goPl1, selectQuad: true, doRotate: true });
              }
              else {
                  setMessage(turnState.goPl1
                      ? {text: 'Player 2\'s turn!', color: cellStyleVariants.secondPl.backgroundColor}
                      : {text: 'Player 1\'s turn!', color: cellStyleVariants.firstPl.backgroundColor});
                  setTurnState({goPl1: !turnState.goPl1, selectQuad: false, doRotate: false});
              }

              setSelectors(newSelectors);
              setQuads(cellsToQuadFormat(newCells, attributes.quadAttrs.columns, quads[qid - 1].length));
              setCells(newCells);
          }
      }
  };

  const onClickCellHandler = (pos, qid) => {
      if (!turnState.doRotate && !turnState.selectQuad) {
          const newCells = cells.slice();
          if (newCells[pos].style === cellStyleVariants.empty)
              newCells[pos] = turnState.goPl1
                ? { ...newCells[pos], style: cellStyleVariants.firstPl, cid: -1 * newCells[pos].cid }
                : { ...newCells[pos], style: cellStyleVariants.secondPl, cid: -1 * newCells[pos].cid };

          const biggestSequence = longestLine(newCells);
          if (biggestSequence.length === 5) {
              const bigSeqPositions = biggestSequence.map(winCell => winCell.pos);
              const highlightCells = newCells
                  .filter(cell => bigSeqPositions.includes(cell.pos));

              newCells.forEach(cell => {
                  const hlCellIdx = highlightCells.indexOf(cell);
                  if (hlCellIdx >= 0)
                      newCells[highlightCells[hlCellIdx].pos].style = cellStyleVariants.win;
              })

              setMessage(turnState.goPl1
                  ? { text: 'Congratulations! Player 1 wins!', color: cellStyleVariants.win.backgroundColor }
                  : { text: 'Congratulations! Player 2 wins!', color: cellStyleVariants.win.backgroundColor });
              setTurnState({ goPl1: turnState.goPl1, selectQuad: true, doRotate: true });
          }
          else {
              setMessage(turnState.goPl1
                  ? {text: 'Player 1, choose a quad', color: cellStyleVariants.firstPl.backgroundColor}
                  : {text: 'Player 2, choose a quad', color: cellStyleVariants.secondPl.backgroundColor});
              setTurnState({ goPl1: turnState.goPl1, selectQuad: true, doRotate: false });
          }

          setQuads(cellsToQuadFormat(newCells, attributes.quadAttrs.columns, quads[qid - 1].length));
          setCells(newCells);
      }
  };

  const onClickRCTL = (key) => {
      if (turnState.doRotate && !turnState.selectQuad) {
          if (key.match(/^(counter-clockwise)$/))
              setMessage({text: 'Rotate!\nCounter Clockwise?', color: message.color});
          if (key.match(/^(clockwise)$/))
              setMessage({text: 'Rotate!\nClockwise?', color: message.color});
      }
  }

  const onKeyDownHandler = (event, callbackQuads) => {
      const key = event.key;


      if (!turnState.doRotate && !turnState.selectQuad) {
          const newCells = cells.slice();
          const selectCell = callbackQuads.flat()
              .find(cell => cell.cid < 0
                  && cell.style === (turnState.goPl1 ? cellStyleVariants.firstPl : cellStyleVariants.secondPl));

          const isLeftmostCol = (idx) => (arrayDims.x * arrayDims.y) % idx === 0
              && (arrayDims.x * arrayDims.y) % Math.floor((idx + 1) / 2) !== 0;

          if (!selectCell) {
              const start = Math.floor(Math.random() * arrayDims.x * arrayDims.y);
              newCells[start] = {
                  ...newCells[start],
                  style: cellStyleVariants.firstPl
              };
              setCells(newCells);
          }
          else {
              if (key.match(/^(ArrowUp|w)$/)) {
                  newCells[selectCell.pos - (selectCell.pos - arrayDims.x >= 0 ? arrayDims.x : 0)] = {
                      ...newCells[selectCell.pos - (selectCell.pos - arrayDims.x >= 0 ? arrayDims.x : 0)],
                      style: turnState.goPl1 ? cellStyleVariants.firstPl : cellStyleVariants.secondPl
                  };
                  if (selectCell.pos - arrayDims.x >= 0)
                      newCells[selectCell.pos] = selectCell.pos - arrayDims.x >= 0
                          ? { ...newCells[selectCell.pos], style: cellStyleVariants.empty }
                          : newCells[selectCell.pos];
              }
              if (key.match(/^(ArrowDown|s)$/)) {
                  newCells[selectCell.pos + (selectCell.pos + arrayDims.x >= 0 ? arrayDims.x : 0)] = {
                      ...newCells[selectCell.pos + (selectCell.pos + arrayDims.x >= 0 ? arrayDims.x : 0)],
                      style: turnState.goPl1 ? cellStyleVariants.firstPl : cellStyleVariants.secondPl
                  };
                  if (selectCell.pos + arrayDims.x >= 0)
                      newCells[selectCell.pos] = selectCell.pos + arrayDims.x < cells.length
                          ? { ...newCells[selectCell.pos], style: cellStyleVariants.empty }
                          : newCells[selectCell.pos];
              }
              if (key.match(/^(ArrowLeft|a)$/)) {
                  newCells[selectCell.pos - (!isLeftmostCol(selectCell.pos) && selectCell.pos - 1 >= 0 ? 1 : 0)] = {
                      ...newCells[selectCell.pos - (!isLeftmostCol(selectCell.pos) && selectCell.pos - 1 >= 0 ? 1 : 0)],
                      style: turnState.goPl1 ? cellStyleVariants.firstPl : cellStyleVariants.secondPl
                  };
                  if (selectCell.pos - 1 >= 0)
                      newCells[selectCell.pos] = !isLeftmostCol(selectCell.pos)
                          ? { ...newCells[selectCell.pos], style: cellStyleVariants.empty }
                          : newCells[selectCell.pos];
              }
              if (key.match(/^(ArrowRight|d)$/)) {
                  newCells[selectCell.pos + (!isLeftmostCol(selectCell.pos + 1) && selectCell.pos + 1 < cells.length ? 1 : 0)] = {
                      ...newCells[selectCell.pos + (!isLeftmostCol(selectCell.pos + 1) && selectCell.pos + 1 < cells.length ? 1 : 0)],
                      style: turnState.goPl1 ? cellStyleVariants.firstPl : cellStyleVariants.secondPl
                  };
                  if (selectCell.pos + 1 < cells.length)
                      newCells[selectCell.pos] = !isLeftmostCol(selectCell.pos + 1)
                          ? { ...newCells[selectCell.pos], style: cellStyleVariants.empty }
                          : newCells[selectCell.pos];
              }
              if (key.match(/^(Enter)$/)) {
                  newCells[selectCell.pos] = {
                      ...newCells[selectCell.pos],
                      style: turnState.goPl1 ? cellStyleVariants.firstPl : cellStyleVariants.secondPl,
                      cid: -1 * newCells[selectCell.pos].cid
                  }
                  setTurnState({goPl1: turnState.goPl1, selectQuad: true, doRotate: false});
                  setMessage(turnState.goPl1
                      ? {text: 'Player 1, choose a quad', color: message.color}
                      : {text: 'Player 2, choose a quad', color: message.color});
              }
              setCells(newCells);
          }
      }
      else {
          const currIdx = selectors
              .reduce((targetIdx, s, idx) => targetIdx + (s.backgroundColor === '#e4741d' ? idx : 0), 0);
          const newSelectors = selectors.slice();

          if (turnState.selectQuad && !turnState.doRotate) {
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
          if (turnState.doRotate && !turnState.selectQuad) {
              console.log(currIdx);
              if (key.match(/^(ArrowLeft|a)$/))
                  setMessage({text: 'Rotate!\nCounter Clockwise?', color: message.color});
              if (key.match(/^(ArrowRight|d)$/))
                  setMessage({text: 'Rotate!\nClockwise?', color: message.color});
              if (key.match(/^(Enter)$/)) {
                  const newCells = rotateQuad(callbackQuads[currIdx], !message.text.match(/(Counter Clockwise\?)$/));
                  newSelectors[currIdx].backgroundColor = '#00000000';

                  const biggestSequence = longestLine(newCells);
                  if (biggestSequence.length === 5) {
                      const bigSeqPositions = biggestSequence.map(winCell => winCell.pos);
                      const highlightCells = newCells
                          .filter(cell => bigSeqPositions.includes(cell.pos));

                      newCells.forEach(cell => {
                          const hlCellIdx = highlightCells.indexOf(cell);
                          if (hlCellIdx >= 0)
                              newCells[highlightCells[hlCellIdx].pos].style = cellStyleVariants.win;
                      })

                      setMessage(biggestSequence[0].style === cellStyleVariants.firstPl
                          ? { text: 'Congratulations! Player 1 wins!', color: cellStyleVariants.win.backgroundColor }
                          : { text: 'Congratulations! Player 2 wins!', color: cellStyleVariants.win.backgroundColor });
                      setTurnState({ goPl1: turnState.goPl1, selectQuad: true, doRotate: true });
                  }
                  else {
                      setMessage(turnState.goPl1
                          ? {text: 'Player 2\'s turn!', color: cellStyleVariants.secondPl.backgroundColor}
                          : {text: 'Player 1\'s turn!', color: cellStyleVariants.firstPl.backgroundColor});
                      setTurnState({goPl1: !turnState.goPl1, selectQuad: false, doRotate: false});
                  }

                  setSelectors(newSelectors);
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
