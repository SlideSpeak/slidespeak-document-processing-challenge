import json

import requests
import asyncio
import websockets


STATUS_ORDER = ['processing', 'analyzing', 'analyzing', 'complete']

async def connect_to_ws(document_id):
    """
    Connects to the WebSocket service using the provided document ID.
    """
    ws_url = f"ws://127.0.0.1:8000/ws/documents/{document_id}"

    try:
        async with websockets.connect(ws_url) as websocket:
            print(f"Connected to WebSocket for document {document_id}")
            status_idx = 0
            while True:
                response = await websocket.recv()
                json_resp = json.loads(json.loads(response))
                assert json_resp['status'] == STATUS_ORDER[status_idx] or json_resp['status'] == 'error', 'Incorrect status'
                status_idx += 1
                print(f"Server: {response}")
                if 'error' in response or 'complete' in response:
                    break
        assert 'result' in json_resp and json_resp['result'], 'Error, no result in final response'
    except Exception as e:
        print(f"Error connecting to WebSocket: {e}")

def upload_document(file_path):
    """
    Uploads a document via the POST endpoint and retrieves the document ID.
    """
    url = "http://127.0.0.1:8000/api/documents/"

    with open(file_path, "rb") as file:
        response = requests.post(url, files={"file": file})

    if response.status_code == 200:
        document_id = response.json().get("document_id")
        print(f"Document uploaded successfully. Document ID: {document_id}")
        return document_id
    else:
        print(f"Failed to upload document. Status code: {response.status_code}")
        print(f"Response: {response.text}")
        return None

def get_document_status(document_id):
    url = f"http://127.0.0.1:8000/api/documents/{document_id}"
    response = requests.get(url=url)
    print(response.json())


async def main():
    file_path = "../slides text.pdf"

    # Upload the document and get the document ID
    document_id = upload_document(file_path)

    if document_id:
        # Connect to the WebSocket service with the document ID
        await connect_to_ws(document_id)
        get_document_status(document_id)



if __name__ == "__main__":
    asyncio.run(main())
