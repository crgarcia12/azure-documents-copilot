# Setup venv
python -m venv .venv
.\.venv\Scripts\activate

# Install dependencies
pip install -U langchain-cli
pip install -r requirements.txt

# Setup environment variables
ren .env.tempalte .env 

# Run venv
uvicorn main:app --reload
