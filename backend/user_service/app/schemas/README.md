this folder defines request payloads, response shapes, validation rules

Why schemas are separate from models?
-> DB is not equal to API, prevents leaking internal fields, allows backward compatibility

example - hashed_password exists in model, never exposed in schema
