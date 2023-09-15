import {Box} from "@mui/material";

const MessageCenter = props => {
    const {message} = props;
    return (
        <Box
            alignItems='center'
            justifyContent='center'
        >
            <p>{message}</p>
        </Box>
    )
};

export {MessageCenter};