import express from 'express';
import bodyParser from 'body-parser';
import { loginUser } from './src/auth';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const result = await loginUser(email, password);

  if (result.success) {
    res.json({ success: true });
  } else {
    res.json({ success: false, error: result.error });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
