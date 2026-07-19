# Authentication APIs

---

## Register User

POST

/api/auth/register

Request

```json
{
    "full_name": "",
    "email": "",
    "password": "",
    "mpin": "",
    "role": ""
}
```

Response

```json
{
    "success": true,
    "message": "Registration Successful"
}
```