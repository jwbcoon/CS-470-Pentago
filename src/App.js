import './App.css';
import {useRef, useState} from "react";
import {arrayDims, attributes, cellAttrs, cellStyleVariants, rotateCtlAttrs} from "./utils/attrs";
import {Box, Container, Grid} from "@mui/material";
import {Board} from "./comp/Board";
import {MessageCenter} from "./comp/MessageCenter";
import {RotateCtl} from "./comp/RotateCtl";

function App() {

    const scanWinState = (newCells) => {

        //Uses Dijkstra's algorithm to find the longest sequence within the array and skip reading anymore once the
        //longest sequence is found
        const biggestSequence = newCells.reduce((longest, cell, idx) => {
            if (longest.length < 5) {
                const [up, down, left, right] = [-1 * arrayDims.x,
                    arrayDims.x,
                    -1, 1];
                const withinBounds = (index, diff) => index >= 0 && index < newCells.length
                    ? index : index + diff;

                for (let i = withinBounds(idx + up, -1 * up); i <= withinBounds(idx + down, -1 * down); i += down) {
                    for (let j = withinBounds(i + left, -1 * left); j <= withinBounds(i + right, -1 * right); j += right) {
                        if (longest.length < 5 && cell.style !== cellStyleVariants.empty && newCells[j] !== cell) {
                            console.log(JSON.stringify(longest), JSON.stringify(cell));
                            const sequence = [ cell ];
                            let dir = 0;
                            while (newCells[withinBounds(j + dir, -1 * dir)].style === sequence[sequence.length - 1].style
                            && newCells[withinBounds(j + dir, -1 * dir)].pos !== sequence[sequence.length - 1].pos
                            && sequence.length < 5) {
                                sequence.push(newCells[withinBounds(j + dir, -1 * dir)]);
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


        //Handle scenario where a valid win sequence is found
        if (biggestSequence.length === 5) {
            const bigSeqPositions = biggestSequence.map(winCell => winCell.pos);
            const highlightCells = newCells
                .filter(cell => bigSeqPositions.includes(cell.pos));

            newCells.forEach(cell => {
                if (highlightCells.includes(cell))
                    newCells[cell.pos].style = cellStyleVariants.win;
            })

            return { newMessage: turnState.goPl1
                    ? { text: 'Congratulations! Player 1 wins!', color: cellStyleVariants.win.backgroundColor }
                    : { text: 'Congratulations! Player 2 wins!', color: cellStyleVariants.win.backgroundColor },
                     newTurnState: { goPl1: turnState.goPl1, selectQuad: true, doRotate: true } };
        }
        return { newMessage: null, newTurnState: null };
    }

    const rotateQuad = (quadCells, clockwise = true) => {
        const newCells = cells.slice();

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
          if (idx.toString().match(/^((0)|(1)|(2)|(6)|(7)|(8)|(12)|(13)|(14))$/)) return 1; //northwest quad
          if (idx.toString().match(/^((3)|(4)|(5)|(9)|(10)|(11)|(15)|(16)|(17))$/)) return 2; //northeast quad
          if (idx.toString().match(/^((18)|(19)|(20)|(24)|(25)|(26)|(30)|(31)|(32))$/)) return 3; //southwest quad
          if (idx.toString().match(/^((21)|(22)|(23)|(27)|(28)|(29)|(33)|(34)|(35))$/)) return 4; //southeast quad
      }
      return Array.from({ length: arrayDims.x * arrayDims.y },
          (cell, idx) => ({ ...cellAttrs, cid: -1 * (idx + 1), qid: determineQuad(idx), pos: idx }));
  }; //cid uniquely identifies cells, is negative when they are unplaced and positive when they are placed.
     //qid is the quadrant ("quad") a cell resides in, counted in 1-based indexing, and the pos is the index of
     //a cell with reference to the 6x6 grid cells.

  const initializeQuads = () => cellsToQuadFormat(cells, attributes.quadAttrs.columns,
              attributes.boardAttrs.columns * attributes.quadAttrs.columns);


  const initializeSelectors = () => Array.from({ length: 4 }, () => ({ backgroundColor: '#00000000' }));

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
        if (!turnState.selectQuad || !turnState.doRotate) {
            if (turnState.selectQuad) {
                if (selectors[qid - 1].backgroundColor === '#00000000') {
                    const newSelectors = selectors.map((selector, idx) => idx === qid - 1
                        ? { backgroundColor: '#e4741d' }
                        : { backgroundColor: '#00000000' });
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

                const stateData = scanWinState(newCells, turnState.doRotate);

                const newMessage = stateData.newMessage ? stateData.newMessage
                    : (turnState.goPl1
                        ? { text: 'Player 2\'s turn!', color: cellStyleVariants.secondPl.backgroundColor }
                        : { text: 'Player 1\'s turn!', color: cellStyleVariants.firstPl.backgroundColor }
                    );
                const newTurnState = stateData.newTurnState ? stateData.newTurnState
                    : { goPl1: !turnState.goPl1, selectQuad: false, doRotate: false };
                setMessage(newMessage);
                setTurnState(newTurnState);
                setSelectors(selectors
                    .map((selector, idx) =>
                        stateData.newTurnState
                            ? ({ ...selector, backgroundColor: cellStyleVariants.win.backgroundColor })
                            : selector));

                setQuads(cellsToQuadFormat(newCells, attributes.quadAttrs.columns, quads[qid - 1].length));
                setCells(newCells);
            }
        }
    };

    const onClickCellHandler = (pos, qid) => {
        if (!turnState.doRotate && !turnState.selectQuad) {
            const newCells = cells.slice();
            const selectCell = newCells.find(cell => cell.cid < 0
                && cell.style === (turnState.goPl1 ? cellStyleVariants.firstPl : cellStyleVariants.secondPl));
            if (newCells[pos].style === cellStyleVariants.empty)
                newCells[pos] = turnState.goPl1
                    ? { ...newCells[pos], style: cellStyleVariants.firstPl, cid: -1 * newCells[pos].cid }
                    : { ...newCells[pos], style: cellStyleVariants.secondPl, cid: -1 * newCells[pos].cid };
            if (selectCell)
                newCells[selectCell.pos].style = cellStyleVariants.empty;

            const stateData = scanWinState(newCells, {});

            const newMessage = stateData.newMessage ? stateData.newMessage
                : (turnState.goPl1
                        ? { text: 'Player 1, choose a quad', color: cellStyleVariants.firstPl.backgroundColor }
                        : { text: 'Player 2, choose a quad', color: cellStyleVariants.secondPl.backgroundColor }
                );
            const newTurnState = stateData.newTurnState ? stateData.newTurnState
                : { goPl1: turnState.goPl1, selectQuad: true, doRotate: false };
            setMessage(newMessage);
            setTurnState(newTurnState);
            setSelectors(selectors
                .map((selector, idx) =>
                    (stateData.newTurnState ? qid : idx + 1) === qid
                        ? ({
                            ...selector,
                            backgroundColor: stateData.newTurnState
                                ? cellStyleVariants.win.backgroundColor
                                : '#e4741d'
                        })
                        : selector));

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

        //If block for managing selecting squares with a keyboard
        if (!turnState.doRotate && !turnState.selectQuad) {
            const newCells = cells.slice();
            const selectCell = callbackQuads.flat()
                .find(cell => cell.cid < 0 // negative cid defines the select cell
                    && cell.style !== cellStyleVariants.empty); // cell style is not empty defines the select cell

            const isLeftmostCol = (idx) => idx % arrayDims.y === 0;

            //Add a random cell if a keyboard input is occuring, but no select cell is present
            if (!selectCell) {
                let start = Math.floor(Math.random() * arrayDims.x * arrayDims.y);
                while (newCells[start].style !== cellStyleVariants.empty)
                    start = Math.floor(Math.random() * arrayDims.x * arrayDims.y);
                newCells[start] = {
                    ...newCells[start],
                    style: turnState.goPl1 ? cellStyleVariants.firstPl : cellStyleVariants.secondPl
                };
                setCells(newCells);
            }
            else { //Move the select cell in the direction the keyboard inputs it.
                if (key.match(/^(ArrowUp|w)$/)) {
                    const next = selectCell.pos - (selectCell.pos - arrayDims.x >= 0 ? arrayDims.x : 0);
                    if (newCells[next].style === cellStyleVariants.empty) // write to arriving cell if it is empty
                        newCells[next] = {
                            ...newCells[next],
                            style: turnState.goPl1 ? cellStyleVariants.firstPl : cellStyleVariants.secondPl
                        };
                    else if (selectCell.pos - arrayDims.x >= 0) { // write to arriving cell with the invalid square
                        newCells[next] = {
                            ...newCells[next],
                            style: cellStyleVariants.invalid,
                            styleMemory: newCells[next].style, // record the cell style for when this cell is vacated
                            cid: -1 * newCells[next].cid // make this cell have a negative cid, so it is selectable
                        };
                    }
                    if (selectCell.pos - arrayDims.x >= 0) // manage the state of the departing square
                        if (newCells[next].style.styleMemory) // remove the styleMemory property of next cell
                            delete newCells[next].style.styleMemory;
                        if (newCells[selectCell.pos].style === cellStyleVariants.invalid) // set the departing cell to its previous state
                            newCells[selectCell.pos] = selectCell.pos - arrayDims.x >= 0
                                ? { ...newCells[selectCell.pos], style: newCells[selectCell.pos].styleMemory, cid: -1 * newCells[selectCell.pos].cid }
                                : newCells[selectCell.pos];
                        else // set the departing cell back to empty
                            newCells[selectCell.pos] = selectCell.pos - arrayDims.x >= 0
                                ? { ...newCells[selectCell.pos], style: cellStyleVariants.empty, cid: newCells[selectCell.pos].cid }
                                : newCells[selectCell.pos];
                }
                if (key.match(/^(ArrowDown|s)$/)) {
                    const next = selectCell.pos + (selectCell.pos + arrayDims.x < cells.length ? arrayDims.x : 0);
                    if (newCells[next].style === cellStyleVariants.empty)
                        newCells[next] = {
                            ...newCells[next],
                            style: turnState.goPl1 ? cellStyleVariants.firstPl : cellStyleVariants.secondPl
                        };
                    else if (selectCell.pos + arrayDims.x < cells.length) { // write to arrival cell with the invalid square to pass through, but not play on it.
                        newCells[next] = {
                            ...newCells[next],
                            style: cellStyleVariants.invalid,
                            styleMemory: newCells[next].style,
                            cid: -1 * newCells[next].cid
                        };
                    }
                    if (selectCell.pos + arrayDims.x < cells.length) // manage the state of the departing square
                        if (newCells[next].style.styleMemory)
                            delete newCells[next].style.styleMemory;
                    if (newCells[selectCell.pos].style === cellStyleVariants.invalid)
                        newCells[selectCell.pos] = selectCell.pos + arrayDims.x < cells.length
                            ? { ...newCells[selectCell.pos], style: newCells[selectCell.pos].styleMemory, cid: -1 * newCells[selectCell.pos].cid }
                            : newCells[selectCell.pos];
                    else
                        newCells[selectCell.pos] = selectCell.pos + arrayDims.x < cells.length
                            ? { ...newCells[selectCell.pos], style: cellStyleVariants.empty, cid: newCells[selectCell.pos].cid }
                            : newCells[selectCell.pos];
                }
                if (key.match(/^(ArrowLeft|a)$/)) {
                    const next = selectCell.pos - (!isLeftmostCol(selectCell.pos)
                              && selectCell.pos - 1 >= 0 ? 1 : 0);
                    if (newCells[next].style === cellStyleVariants.empty)
                        newCells[next] = {
                            ...newCells[next],
                            style: turnState.goPl1 ? cellStyleVariants.firstPl : cellStyleVariants.secondPl
                        };
                    else if (!isLeftmostCol(selectCell.pos) && selectCell.pos - 1 >= 0) { // write to arrival cell with the invalid square to pass through, but not play on it.
                        newCells[next] = {
                            ...newCells[next],
                            style: cellStyleVariants.invalid,
                            styleMemory: newCells[next].style,
                            cid: -1 * newCells[next].cid
                        };
                    }
                    if (!isLeftmostCol(selectCell.pos) && selectCell.pos - 1 >= 0) // manage the state of the departing square
                        if (newCells[next].style.styleMemory)
                            delete newCells[next].style.styleMemory;
                        if (newCells[selectCell.pos].style === cellStyleVariants.invalid)
                            newCells[selectCell.pos] = !isLeftmostCol(selectCell.pos) && selectCell.pos - 1 >= 0
                                ? { ...newCells[selectCell.pos], style: newCells[selectCell.pos].styleMemory, cid: -1 * newCells[selectCell.pos].cid }
                                : newCells[selectCell.pos];
                        else
                            newCells[selectCell.pos] = !isLeftmostCol(selectCell.pos) && selectCell.pos - 1 >= 0
                                ? { ...newCells[selectCell.pos], style: cellStyleVariants.empty, cid: newCells[selectCell.pos].cid }
                                : newCells[selectCell.pos];
                }
                if (key.match(/^(ArrowRight|d)$/)) {
                    const next = selectCell.pos + (!isLeftmostCol(selectCell.pos + 1)
                              && selectCell.pos + 1 < cells.length ? 1 : 0);
                    if (newCells[next].style === cellStyleVariants.empty)
                        newCells[next] = {
                            ...newCells[next],
                            style: turnState.goPl1 ? cellStyleVariants.firstPl : cellStyleVariants.secondPl
                        };
                    else if (!isLeftmostCol(selectCell.pos + 1) && selectCell.pos + 1 < cells.length) { // write to arrival cell with the invalid square to pass through, but not play on it.
                        newCells[next] = {
                            ...newCells[next],
                            style: cellStyleVariants.invalid,
                            styleMemory: newCells[next].style,
                            cid: -1 * newCells[next].cid
                        };
                    }
                    if (!isLeftmostCol(selectCell.pos + 1) && selectCell.pos + 1 < cells.length) // manage the state of the departing square
                        if (newCells[next].style.styleMemory)
                            delete newCells[next].style.styleMemory;
                        if (newCells[selectCell.pos].style === cellStyleVariants.invalid)
                            newCells[selectCell.pos] = !isLeftmostCol(selectCell.pos + 1) && selectCell.pos + 1 < cells.length
                                ? { ...newCells[selectCell.pos], style: newCells[selectCell.pos].styleMemory, cid: -1 * newCells[selectCell.pos].cid }
                                : newCells[selectCell.pos];
                        else
                            newCells[selectCell.pos] = !isLeftmostCol(selectCell.pos + 1) && selectCell.pos + 1 < cells.length
                                ? { ...newCells[selectCell.pos], style: cellStyleVariants.empty, cid: newCells[selectCell.pos].cid }
                                : newCells[selectCell.pos];
                }
                // manage the player placing the select cell
                if (key.match(/^(Enter)$/) && newCells[selectCell.pos].style !== cellStyleVariants.invalid) {
                    newCells[selectCell.pos] = {
                        ...newCells[selectCell.pos],
                        style: turnState.goPl1 ? cellStyleVariants.firstPl : cellStyleVariants.secondPl,
                        cid: -1 * newCells[selectCell.pos].cid
                    }

                    const stateData = scanWinState(newCells, {});

                    const newMessage = stateData.newMessage ? stateData.newMessage
                        : (turnState.goPl1
                                ? { text: 'Player 1, choose a quad', color: cellStyleVariants.firstPl.backgroundColor }
                                : { text: 'Player 2, choose a quad', color: cellStyleVariants.secondPl.backgroundColor }
                        );
                    const newTurnState = stateData.newTurnState ? stateData.newTurnState
                        : { goPl1: turnState.goPl1, selectQuad: true, doRotate: false };
                    setMessage(newMessage);
                    setTurnState(newTurnState);
                    setSelectors(selectors
                        .map((selector, idx) =>
                            (stateData.newTurnState ? selectCell.qid : idx + 1) === selectCell.qid
                                ? ({
                                    ...selector,
                                    backgroundColor: stateData.newTurnState
                                        ? cellStyleVariants.win.backgroundColor
                                        : '#e4741d'
                                })
                                : selector));
                }
                setCells(newCells);
            }
        }
        else { // select one of four quads to rotate, the player selecting a square, and the player choosing a direction
            const currIdx = selectors //currIdx is the only highlighted square or the first square
                .reduce((targetIdx, s, idx) => targetIdx + (s.backgroundColor === '#e4741d' ? idx : 0), 0);
            const newSelectors = selectors.slice();

            if (turnState.selectQuad && !turnState.doRotate) {
                if (key.match(/^(ArrowUp|w)$/)) {
                    newSelectors[currIdx - (currIdx - 2 >= 0 ? 2 : 0)] = { backgroundColor: '#e4741d' };
                    setMessage({ text: `Quad ${currIdx + 1 - (currIdx - 2 >= 0 ? 2 : 0) }?`, color: message.color});
                    if (currIdx - 2 >= 0)
                        newSelectors[currIdx] = { backgroundColor: '#00000000' };
                }
                if (key.match(/^(ArrowDown|s)$/)) {
                    newSelectors[currIdx + (currIdx + 2 < selectors.length ? 2 : 0)] = {backgroundColor: '#e4741d'};
                    setMessage({
                        text: `Quad ${ currIdx + 1 + (currIdx + 2 < selectors.length ? 2 : 0) }?`,
                        color: message.color
                    });
                    if (currIdx + 2 < selectors.length)
                        newSelectors[currIdx] = {backgroundColor: '#00000000'};
                }
                if (key.match(/^(ArrowLeft|a)$/)) {
                    newSelectors[currIdx - (currIdx !== 2 && currIdx - 1 >= 0 ? 1 : 0)] = { backgroundColor: '#e4741d' };
                    setMessage({
                        text: `Quad ${ currIdx + 1 - (currIdx !== 2 && currIdx - 1 >= 0 ? 1 : 0) }?`,
                        color: message.color
                    });
                    if (currIdx !== 2 && currIdx - 1 >= 0)
                        newSelectors[currIdx] = {backgroundColor: '#00000000'};
                }
                if (key.match(/^(ArrowRight|d)$/)) {
                    newSelectors[currIdx + (currIdx !== 1 && currIdx + 1 < selectors.length ? 1 : 0)] = { backgroundColor: '#e4741d' };
                    setMessage({
                        text: `Quad ${ currIdx + 1 + (currIdx !== 1 && currIdx + 1 < selectors.length ? 1 : 0) }?`,
                        color: message.color
                    });
                    if (currIdx !== 1 && currIdx + 1 < selectors.length)
                        newSelectors[currIdx] = {backgroundColor: '#00000000'};
                }
                if (key.match(/^(Enter)$/)) {
                    setTurnState({ goPl1: turnState.goPl1, selectQuad: false, doRotate: true });
                    setMessage({ text: 'Rotate! Choose a direction', color: message.color });
                }
                setSelectors(newSelectors);
            }
            if (turnState.doRotate && !turnState.selectQuad) {
                console.log(currIdx);
                if (key.match(/^(ArrowLeft|a)$/))
                    setMessage({ text: 'Rotate!\nCounter Clockwise?', color: message.color });
                if (key.match(/^(ArrowRight|d)$/))
                    setMessage({ text: 'Rotate!\nClockwise?', color: message.color });
                if (key.match(/^(Enter)$/)) {
                    const newCells = rotateQuad(callbackQuads[currIdx], !message.text.match(/(Counter Clockwise\?)$/));
                    newSelectors[currIdx].backgroundColor = '#00000000';

                    const stateData = scanWinState(newCells, turnState.doRotate);

                    const newMessage = stateData.newMessage ? stateData.newMessage
                        : (turnState.goPl1
                                ? { text: 'Player 2\'s turn!', color: cellStyleVariants.secondPl.backgroundColor }
                                : { text: 'Player 1\'s turn!', color: cellStyleVariants.firstPl.backgroundColor }
                        );
                    const newTurnState = stateData.newTurnState ? stateData.newTurnState
                        : { goPl1: !turnState.goPl1, selectQuad: false, doRotate: false };
                    setMessage(newMessage);
                    setTurnState(newTurnState);
                    setSelectors(selectors
                        .map((selector, idx) =>
                            stateData.newTurnState
                                ? ({ ...selector, backgroundColor: cellStyleVariants.win.backgroundColor })
                                : selector));

                    setQuads(cellsToQuadFormat(newCells, attributes.quadAttrs.columns, callbackQuads[currIdx].length));
                    setCells(newCells);
                }
            }
        }
    };

    const onBlurHandler = (event) => inputRef.current.focus();



    return (
        <Container
            maxWidth={false}
            sx={{
                width: '100vw',
                height: '100vh',
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
