#!/usr/bin/env python3
"""Emit a Web Push VAPID key pair (base64url) for .env — one key per line: public, then private."""

import base64

from cryptography.hazmat.primitives.serialization import Encoding, PublicFormat
from py_vapid import Vapid01


def b64url(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode().rstrip("=")


def main() -> None:
    vapid = Vapid01()
    vapid.generate_keys()
    priv_raw = vapid.private_key.private_numbers().private_value.to_bytes(32, "big")
    pub_raw = vapid.public_key.public_bytes(
        Encoding.X962, PublicFormat.UncompressedPoint
    )
    print(b64url(pub_raw))
    print(b64url(priv_raw))


if __name__ == "__main__":
    main()
