import os
import simplejson

from flask import Flask, render_template, jsonify, request
from werkzeug import SharedDataMiddleware
import zmq

app = Flask(__name__)

# Static file handling
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.join(ROOT_DIR, 'static')
app.wsgi_app = SharedDataMiddleware(app.wsgi_app, {
    '/static/': STATIC_DIR,
})

# zeromq set up
context = zmq.Context()
sock = context.socket(zmq.REQ)
sock.connect('ipc:///tmp/darkan.sck')

# Simple admin server proxy
def run(cmd, *args):
    sock.send_json({'command': cmd, 'args': args})
    return sock.recv_json()

@app.route('/')
def index():
    return render_template('index.html')

"""
@app.route('/host/<int:hostid>')
def host_details(hostid):
    data = {
        'host': run('hosts.details', hostid)['host'],
        'latest': run('values.latest', hostid)['values'],
    }
    return render_template('host.html', **data)
"""

### API ###
@app.route('/a/triggers')
def api_triggers():
    triggers = run('triggers.list')['triggers']
    return jsonify(models=triggers)

@app.route('/a/actions')
def api_actions():
    actions = run('actions.list')['actions']
    actions = [{'id': i, 'name': n['name'], 'description': n['description']} for i,n in enumerate(actions, start=1)]
    return jsonify(models=actions)

@app.route('/a/hosts')
def api_hosts():
    hosts = run('hosts.list')['hosts']
    return jsonify(models=hosts)

@app.route('/a/autohosts')
def api_autohosts():
    autohosts = run('autohosts.list')['hosts']
    return jsonify(models=autohosts)

@app.route('/a/add-autohost/<int:hostid>')
def api_add_autohost(hostid):
    run('autohosts.add', hostid)
    return jsonify({})

@app.route('/a/decline-autohost/<int:hostid>')
def api_decline_autohost(hostid):
    run('autohosts.decline', hostid)
    return jsonify({})

@app.route('/a/trigger', methods=['POST'])
def api_add_trigger():
    res = run('triggers.add', simplejson.loads(request.data))
    return jsonify(**res)

if __name__ == '__main__':
    app.debug = True
    app.run(host='0.0.0.0')
