# Page snapshot

```yaml
- generic [ref=e4]:
  - heading "Yarn Management" [level=4] [ref=e5]
  - generic [ref=e6]:
    - generic [ref=e7]:
      - generic [ref=e8]:
        - text: Email
        - generic [ref=e9]: "*"
      - generic [ref=e10]:
        - textbox "Email" [ref=e11]: admin@example.com
        - group:
          - generic: Email *
    - generic [ref=e12]:
      - generic [ref=e13]:
        - text: Password
        - generic [ref=e14]: "*"
      - generic [ref=e15]:
        - textbox "Password" [ref=e16]: admin123456!
        - group:
          - generic: Password *
    - button "Sign in" [ref=e17] [cursor=pointer]
    - button "Sign in with Passkey" [ref=e18] [cursor=pointer]:
      - img [ref=e20]
      - text: Sign in with Passkey
```