import './App.css';
import {useState} from "react";
import {arrayDims, attributes} from "./utils/attrs";
import {Box} from "@mui/material";
import {Board} from "./comp/Board";
import {MessageCenter} from "./comp/MessageCenter";

function App() {
  const initializeCells = () => new Array(arrayDims.x * arrayDims.y)
      .fill({
          ...attributes.cellAttrs
      });

  const [message, setMessage] = useState('Welcome to Pentago!');
  const [cells, setCells] = useState(initializeCells);

  const onClickQuadHandler = () => {};

  const onClickCellHandler = () => {};



  return (
    <Box
        sx={{
            width: 1080,
            height: 720,
            alignItems: 'center'
        }}
    >
        <MessageCenter message={message}/>
        <Board cells={cells}
               attrs={attributes}
               onClickQuadHandler={onClickQuadHandler}
               onClickCellHandler={onClickCellHandler}
        />
    </Box>
  );
}

export default App;
