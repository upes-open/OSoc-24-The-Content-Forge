import requests

url = "http://127.0.0.1:8000/generate_image/"
files = {'file': open(r'C:\Users\DELL\Downloads\Frame 7.png', 'rb')}
data = {'text': 'Hi Myself Ayush Dey', 'filter_type': 'black_and_white'}  

try:
    response = requests.post(url, files=files, data=data)

    if response.status_code == 200:
        with open("result.png", "wb") as f:
            f.write(response.content)
        print("Image saved as result.png")
    else:
        print(f"Failed to create image. Status code: {response.status_code}")

except requests.exceptions.RequestException as e:
    print(f"Error during request: {str(e)}")


