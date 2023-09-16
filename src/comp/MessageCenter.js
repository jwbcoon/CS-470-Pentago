import {Container, Typography} from "@mui/material";

const MessageCenter = props => {
    const {message} = props;
    return (
        <Container
            sx={{
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            <Typography sx={{ color: message.color, textAlign: 'center' }}>
                {message.text}
            </Typography>
        </Container>
    )
};

export { MessageCenter };
