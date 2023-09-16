import './App.css';
import {useState} from "react";
import {arrayDims, attributes} from "./utils/attrs";
import {Box} from "@mui/material";
import {Board} from "./comp/Board";
import {MessageCenter} from "./comp/MessageCenter";

function App() {
  const initializeCells = () => {
      const calcQuad = idx => {
          if (idx.toString().match(/^(0)$|^(1)$|^(2)$|^(6)$|^(7)$|^(8)$|^(12)$|^(13)$|^(14)$/)) return 1;
          if (idx.toString().match(/^(3)$|^(4)$|^(5)$|^(9)$|^(10)$|^(11)$|^(15)$|^(16)$|^(17)$/)) return 2;
          if (idx.toString().match(/^(18)$|^(19)$|^(20)$|^(24)$|^(25)$|^(26)$|^(30)$|^(31)$|^(32)$/)) return 3;
          if (idx.toString().match(/^(21)$|^(22)$|^(23)$|^(27)$|^(28)$|^(29)$|^(33)$|^(34)$|^(35)$/)) return 4;
      }
      return new Array(arrayDims.x * arrayDims.y).fill({ ...attributes.cellAttrs })
          .map((cell, idx) => ({ cid: idx, quad: calcQuad(idx) }));
  };

  const [message, setMessage] = useState('Welcome to Pentago!');
  const [cells, setCells] = useState(initializeCells);
  const [quads, setQuads] = useState([[], [], [], []]);

  const onClickQuadHandler = () => {};

  const onClickCellHandler = (cid, quad, idx) => {
      console.log(`I am cell ${cid} of quadrant ${quad} and my index is ${idx}`);
  };



  return (
    <Box
        sx={{
            width: 1080,
            height: 720,
            alignItems: 'center'
        }}
    >
        <MessageCenter message={message}/>
        <Board cells={initializeCells()}
               quads={quads}
               attrs={attributes}
               onClickQuadHandler={onClickQuadHandler}
               onClickCellHandler={onClickCellHandler}
        />
    </Box>
  );
}

export default App;
