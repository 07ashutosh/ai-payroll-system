#!/usr/bin/env python3
"""
ML Service Runner
Starts the Flask ML API service
"""

from api import create_app
import os

if __name__ == '__main__':
    # Get configuration from environment
    config_name = os.getenv('FLASK_ENV', 'development')
    
    # Create app
    app = create_app(config_name)
    
    # Get port from config
    port = app.config.get('PORT', 8000)
    host = app.config.get('HOST', '0.0.0.0')
    debug = app.config.get('DEBUG', True)
    
    print(f"""
╔═══════════════════════════════════════════╗
║   ML Service Starting                      ║
║                                           ║
║   Environment: {config_name:<20} ║
║   Host: {host:<30} ║
║   Port: {port:<30} ║
║   Debug: {str(debug):<29} ║
╚═══════════════════════════════════════════╝
    """)
    
    # Run the app
    app.run(
        host=host,
        port=port,
        debug=debug
    )
