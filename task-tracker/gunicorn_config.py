# Gunicorn configuration for Task Activity Tracker
import multiprocessing

# Server socket
bind = "0.0.0.0:8000"  # Render expects port 8000

# Worker processes
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "sync"
worker_connections = 1000
timeout = 30
keepalive = 2

# Logging
accesslog = "-"
errorlog = "-"
loglevel = "info"

# Process naming
proc_name = "task_tracker"

# Server mechanics
daemon = False
pidfile = "/tmp/gunicorn.pid"
user = None
group = None

# SSL (if needed)
keyfile = None
certfile = None

# Performance tuning
max_requests = 1000
max_requests_jitter = 50
preload_app = True

# Security
limit_request_line = 4094
limit_request_fields = 100
limit_request_field_size = 8190
