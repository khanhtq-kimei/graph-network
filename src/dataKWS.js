const TOKEN = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJrd2F5c0B5b3BtYWlsLmNvbSIsImlhdCI6MTcyMjk5NzM2MywiZXhwIjoxNzIzODk3MzYzfQ.nO3pr1RPjjEhQ02nFDYmYWEQU5lZrD4Jvlic6xfp2b0`;


export const getData = async (url) => {
    const myHeaders = new Headers();
    myHeaders.append("workspaceId", 1);
    myHeaders.append("authorization",
    `Bearer ${TOKEN}`
    );
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append('Access-Control-Allow-Origin', '*');

    const requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow"
      };

    const response = await fetch(url, requestOptions);
    const data = await response.json();

    return data;
};
