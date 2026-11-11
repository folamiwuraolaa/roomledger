"""Vercel Python entrypoint for the Flask API.

The frontend can call /api/... on the same Vercel project when this function is
used. A conventional Python host can continue using backend/run.py + gunicorn.
"""
from backend.app import create_app

app = create_app()
