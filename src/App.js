import React, { useState, useRef } from 'react';
import { ThemeProvider, createTheme, alpha } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import ReactMarkdown from 'react-markdown';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Grid,
  Paper,
  TextField,
  Button,
  Box,
  Modal,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  useTheme,
} from '@mui/material';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#BB86FC',
    },
    secondary: {
      main: '#03DAC6',
    },
    background: {
      default: '#121212',
      paper: '#1E1E1E',
    },
    text: {
      primary: '#E1E1E1',
      secondary: '#B0B0B0',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 4,
          },
        },
      },
    },
  },
});

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

function ConjugationTable({ data }) {
  if (!data) return null;

  const tenses = ['present', 'subjunctive', 'future', 'preterite', 'imperfect'];
  const persons = ['yo', 'tú', 'él/ella/usted', 'nosotros', 'ellos/ellas/ustedes'];

  const renderConjugationCell = (tense) => {
    const tenseData = data[tense];
    if (!tenseData) return null;

    return (
      <TableCell
        key={tense}
        sx={{
          padding: 1,
          borderRadius: 1,
          backgroundColor: alpha(theme.palette.primary.main, 0.1),
          minWidth: 180,
        }}
      >
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom align="center">
          {capitalizeFirstLetter(tense)}
        </Typography>
        <Table size="small">
          <TableBody>
            {persons.map((person) => (
              <TableRow key={person} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell
                  component="th"
                  scope="row"
                  sx={{ fontWeight: 'bold', color: theme.palette.text.secondary, py: 0.25, px: 1 }}
                >
                  {person}
                </TableCell>
                <TableCell align="right" sx={{ color: theme.palette.text.primary, py: 0.25, px: 1 }}>
                  {tenseData[person] || 'N/A'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableCell>
    );
  };

  const capitalizeFirstLetter = (string) => string.charAt(0).toUpperCase() + string.slice(1);

  return (
    <TableContainer component={Box} sx={{ overflowX: 'auto', backgroundColor: 'transparent' }}>
      <Table sx={{ minWidth: 650 }}>
        <TableBody>
          <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
            {renderConjugationCell(tenses[0])}
            {renderConjugationCell(tenses[1])}
            {renderConjugationCell(tenses[2])}
          </TableRow>
          <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
            {renderConjugationCell(tenses[3])}
            {renderConjugationCell(tenses[4])}
            <TableCell />
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function App() {
  const [inputText, setInputText] = useState('');
  const [translationText, setTranslationText] = useState('');
  const [definitionText, setDefinitionText] = useState('');
  const [askMeText, setAskMeText] = useState('');
  const [conjugationData, setConjugationData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [askMeQuestion, setAskMeQuestion] = useState('');
  const inputRef = useRef(null);

  const handleAssistMe = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/assist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: inputText }),
      });
      const data = await response.json();
      setTranslationText(data.result);
    } catch (error) {
      console.error('Error:', error);
      setTranslationText('Error occurred while assisting.');
    }
  };

  const handleConjugate = async () => {
    const inputElement = inputRef.current;
    const selectionStart = inputElement.selectionStart;
    const selectionEnd = inputElement.selectionEnd;
    const selectedText = inputElement.value.substring(selectionStart, selectionEnd).trim();

    if (selectedText) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/conjugate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ verb: selectedText }),
        });

        const data = await response.json();

        if (data.error) {
          console.error('Conjugation error:', data.error);
          console.error('Raw response:', data.raw_response);
          // Handle error accordingly
        } else if (data.result) {
          setConjugationData(data.result);
        } else {
          console.error('Unexpected response format:', data);
          // Handle unexpected response
        }
      } catch (error) {
        console.error('Fetch error:', error);
        // Handle fetch error
      }
    } else {
      alert('Please select a verb to conjugate.');
    }
  };

  const handleDefine = async () => {
    const inputElement = inputRef.current;
    const selectionStart = inputElement.selectionStart;
    const selectionEnd = inputElement.selectionEnd;
    const selectedText = inputElement.value.substring(selectionStart, selectionEnd).trim();

    if (selectedText) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/define`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ word: selectedText }),
        });

        const data = await response.json();
        setDefinitionText(data.result);
      } catch (error) {
        console.error('Error:', error);
        setDefinitionText('Error occurred while fetching definition.');
      }
    } else {
      alert('Please select a word to define.');
    }
  };

  const handleAskMe = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleAskMeSubmit = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/question`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: askMeQuestion }),
      });
      const data = await response.json();
      setAskMeText(data.result);
    } catch (error) {
      console.error('Error:', error);
      setAskMeText('Error occurred while processing your question.');
    }
    setIsModalOpen(false);
    setAskMeQuestion('');
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
            Language Learning App
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
              <TextField
                multiline
                rows={4}
                fullWidth
                variant="outlined"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                label="Enter text"
                sx={{ mb: 3 }}
                InputProps={{
                  style: { overflow: 'auto', maxHeight: '150px' },
                }}
                inputRef={inputRef}
              />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Button variant="contained" color="primary" onClick={handleAssistMe} fullWidth>
                    Assist Me
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button variant="outlined" color="secondary" onClick={handleConjugate} fullWidth>
                    Conjugate
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button variant="outlined" color="secondary" onClick={handleDefine} fullWidth>
                    Define
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button variant="outlined" color="secondary" onClick={handleAskMe} fullWidth>
                    Ask Me
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper
              elevation={3}
              sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}
            >
              <Typography variant="h6" gutterBottom color="primary">
                Translation
              </Typography>
              <Paper
                variant="outlined"
                sx={{
                  mb: 3,
                  p: 2,
                  minHeight: '100px',
                  maxHeight: '300px',
                  overflow: 'auto',
                  backgroundColor: '#2c2c2c', // Forcing a dark grey color
                  color: '#ffffff', // Forcing white text
                  fontSize: `0.9rem`,
                  '& > *': { fontSize: 'inherit' },
                  border: '1px solid #BB86FC', // Adding a visible border
                  '& a': {
                    color: '#BB86FC', // Using your primary color for links
                  },
                }}
              >
                <ReactMarkdown>{translationText}</ReactMarkdown>
              </Paper>

              <Typography variant="h6" gutterBottom color="primary">
                Ask Me
              </Typography>
              <TextField
                multiline
                fullWidth
                variant="outlined"
                value={askMeText}
                InputProps={{
                  readOnly: true,
                  style: { overflow: 'auto', flexGrow: 1, minHeight: '100px' },
                }}
                sx={{ mb: 3 }}
              />
              <Typography variant="h6" gutterBottom color="primary">
                Definition
              </Typography>
              <TextField
                multiline
                fullWidth
                variant="outlined"
                value={definitionText}
                InputProps={{
                  readOnly: true,
                  style: { overflow: 'auto', flexGrow: 1, minHeight: '100px' },
                }}
              />
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 3, mt: 3, overflowX: 'auto' }}>
              <Typography variant="h6" gutterBottom color="secondary">
                Conjugation Table
              </Typography>
              <ConjugationTable data={conjugationData} />
            </Paper>
          </Grid>
        </Grid>
      </Container>
      <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
        aria-labelledby="ask-me-modal"
        aria-describedby="ask-me-modal-description"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h6" component="h2" gutterBottom color="primary">
            Ask Me
          </Typography>
          <TextField
            fullWidth
            variant="outlined"
            value={askMeQuestion}
            onChange={(e) => setAskMeQuestion(e.target.value)}
            label="Enter your question"
            sx={{ mb: 2 }}
          />
          <Button variant="contained" color="primary" onClick={handleAskMeSubmit}>
            Submit
          </Button>
        </Box>
      </Modal>
    </ThemeProvider>
  );
}

export default App;
