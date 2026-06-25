import math
from decimal import Decimal

GEO_COORD_DECIMAL_PLACES = 6
_GEO_COORD_QUANTIZE = Decimal("0.000001")


def normalize_geo_decimal(value: Decimal | float | int | str) -> Decimal:
    return Decimal(str(value)).quantize(_GEO_COORD_QUANTIZE)


def distance_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    radius_km = 6371.0
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    d_phi = math.radians(lat2 - lat1)
    d_lambda = math.radians(lng2 - lng1)

    a = (
        math.sin(d_phi / 2) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(d_lambda / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return radius_km * c
