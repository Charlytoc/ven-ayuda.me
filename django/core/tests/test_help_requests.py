from django.test import TestCase

from core.models import HelpRequest


class HelpRequestModelTests(TestCase):
    def test_create_help_request(self):
        request = HelpRequest.objects.create(
            latitude="10.480600",
            longitude="-66.903600",
            severity=HelpRequest.Severity.URGENT,
            description="Necesitamos agua y refugio.",
            contact_name="María",
        )
        self.assertEqual(request.status, HelpRequest.Status.OPEN)
        self.assertEqual(str(request.severity), "urgent")
