import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import { colors, fonts, radius } from '../theme';
import { PRIVACY_VERSION, TERMS_VERSION } from '../lib/legal';

const SUPPORT_EMAIL = process.env.EXPO_PUBLIC_SUPPORT_EMAIL?.trim();
const SUPPORT_PHONE = process.env.EXPO_PUBLIC_SUPPORT_PHONE?.trim();

const DOCUMENTS = [
  {
    id: 'terms',
    label: 'Terms of Service',
    title: 'Terms of Service',
    icon: 'document-text-outline',
    sections: [
      ['1. About these terms', 'These Terms of Service govern access to and use of LexRidesZA, including the mobile application, website and related services (the “Platform”). By creating an account, browsing, posting a request, listing a vehicle or booking through the Platform, you agree to these terms. If you do not agree, do not use the Platform.'],
      ['2. The Platform and the parties', 'LexRidesZA provides digital tools that help users discover vehicle-rental listings and submit transport requests. Unless a booking screen expressly says otherwise, LexRidesZA is a marketplace and communications platform, not the vehicle owner, rental company, transport operator, insurer or employer. A rental or transport service is supplied by the independent provider who accepts the request. The provider and customer are responsible for agreeing to and performing the service contract between them.'],
      ['3. Eligibility and accounts', 'You must be at least 18 years old, legally capable of entering a contract and permitted to use the Platform in your location. Keep your login details confidential, provide accurate information, maintain current contact details and promptly tell us if you suspect unauthorised account access. You are responsible for activity carried out through your account, except where applicable law provides otherwise. We may request reasonable verification before enabling or continuing certain services.'],
      ['4. Using the Platform lawfully', 'Use the Platform only for lawful purposes and in accordance with these terms. Do not misrepresent your identity, bypass safety or payment controls, scrape or disrupt the service, upload malicious code, infringe another person’s rights, or use the Platform to harass, defraud or harm anyone. You must not use another person’s account or submit a request you do not intend to honour.'],
      ['5. Listings and transport requests', 'Providers are responsible for the accuracy, legality and completeness of their listings, including vehicle condition, ownership or authority to rent, photographs, availability, location, permitted use, price, mileage limits, deposit, insurance and cancellation conditions. Customers are responsible for providing accurate trip details and reviewing all listing and provider terms before booking. A job post is a request for offers; it is not itself a confirmed transport booking.'],
      ['6. Bookings and provider services', 'Submitting a booking request does not guarantee availability or acceptance unless the Platform expressly confirms it. Before payment or travel, review the dates, total price, pickup and return arrangements, driver requirements, permitted use, mileage, fuel, deposits, insurance excess and cancellation terms. Providers must deliver the service as agreed and customers must comply with agreed conditions and applicable law. Do not hand over a vehicle or begin a paid service based only on an unverified message.'],
      ['7. Prices, payments and refunds', 'Prices and payment obligations are shown in the applicable listing, booking flow or provider agreement. Payments processed in the Platform are handled by the named payment provider, currently Paystack where enabled; its terms also apply. Do not send card numbers, security codes or banking passwords in messages. Refund eligibility and timing depend on the applicable booking terms, payment-provider processing and consumer-protection law. Nothing in these terms removes a right that cannot lawfully be excluded.'],
      ['8. Cancellations and changes', 'Cancellation, rescheduling, no-show and refund conditions are shown for the specific booking or agreed directly with the provider. Check those conditions before confirming. If a material change, late pickup, vehicle substitution or service failure occurs, contact the provider and use in-app support promptly. We may assist with communications but cannot promise a refund or outcome that is controlled by the provider, payment provider or law.'],
      ['9. Safety, licences and insurance', 'Customers must hold any licence, permit and qualification required for the service and must not drive while impaired or use a vehicle unlawfully. Providers must ensure they are entitled to supply the service and must accurately disclose applicable insurance and restrictions. Platform information is not a substitute for checking the vehicle, documents, insurance cover, driver identity or roadworthiness. Raise urgent safety concerns with the appropriate emergency or regulatory authority.'],
      ['10. Reviews, messages and user content', 'You retain rights in content you submit, but grant us permission to host, store, display and process it as needed to operate, protect and improve the Platform. You warrant that you have rights to submit it and that it is accurate and lawful. Do not post personal information about another person without authority, unlawful material, misleading claims, or content that violates intellectual-property or privacy rights. We may remove content or restrict accounts where reasonably necessary to enforce these terms or comply with law.'],
      ['11. Platform availability and third parties', 'We aim to keep the Platform available and secure, but online services may be interrupted, changed or unavailable. Some features depend on third-party identity, hosting, maps, storage or payment services, which have their own terms and privacy practices. We may change or discontinue a feature for operational, safety, legal or security reasons.'],
      ['12. Suspension and termination', 'You may stop using the Platform and request account deletion through Settings. We may suspend or restrict access where reasonably required to protect users, investigate suspected misuse, address security risks, comply with law or enforce these terms. Outstanding payment, booking, dispute, record-keeping and legal obligations may continue after account closure.'],
      ['13. Liability and consumer rights', 'The Platform is provided subject to applicable law. To the extent permitted by law, we are not responsible for a provider’s independent acts, omissions, vehicle condition, availability or performance, nor for indirect loss that we could not reasonably foresee. We do not exclude liability where exclusion is prohibited, including rights and remedies that consumers have under South African law. Nothing in these terms limits non-waivable rights under the Consumer Protection Act or other applicable law.'],
      ['14. Disputes and governing law', 'Please first contact the provider about a service dispute and contact Platform support if you need help with the Platform. These terms are governed by the laws of the Republic of South Africa, subject to any mandatory consumer-protection rules and the jurisdiction of competent South African courts.'],
      ['15. Changes and contact', `We may update these terms when the service or law changes. The latest version and date are shown here; material changes will be communicated where reasonably practical. Effective version: ${TERMS_VERSION}. ${SUPPORT_EMAIL || SUPPORT_PHONE ? 'Use the configured support contact shown in Help & Support for questions or complaints.' : 'Support contact details have not been configured in this app. The operator should publish a working support contact before public launch.'}`],
    ],
  },
  {
    id: 'privacy',
    label: 'Privacy Policy',
    title: 'Privacy Policy',
    icon: 'shield-checkmark-outline',
    sections: [
      ['1. Who is responsible', 'This policy explains how LexRidesZA processes personal information when you use the Platform. The legal operator and its Information Officer contact must be identified by the service operator before public launch. For now, use the configured in-app support details, if displayed, to direct a privacy request.'],
      ['2. Information we collect', 'Depending on the features you use, information may include your name, email address, telephone number, account and authentication identifiers, profile details, provider or listing information, booking and transport-request details, messages, reviews, uploaded photographs, saved locations, preferences, support correspondence, and payment status or transaction references. If you grant location permission, the app can read your device location; it is sent to the other participant only when you separately choose to share live location for a confirmed booking. Payment card credentials are handled by the payment provider and should not be sent through app messages.'],
      ['3. Information collected automatically', 'The service and its hosting or security providers may process technical information needed to operate the app, such as device or browser details, IP address, session data, diagnostic events and security logs. The app may store authentication/session information on your device or browser. Exact analytics and advertising technologies depend on the production configuration; do not assume optional tracking is enabled unless it is disclosed in the app.'],
      ['4. How we use information', 'We use information to create and secure accounts, display profiles and listings, match customers and providers, manage bookings and transport requests, support communications, process payment status, store photos, respond to enquiries, prevent fraud and abuse, troubleshoot and improve the service, comply with legal obligations, and establish or defend legal claims. We use information for additional purposes only where permitted by law and explained to you.'],
      ['5. Legal bases and consent', 'Where the Protection of Personal Information Act (POPIA) applies, we process information on an appropriate lawful basis, which may include performing a contract, complying with a legal obligation, pursuing a legitimate interest that does not override your rights, or your consent. Where consent is required, you may withdraw it; withdrawal does not make earlier lawful processing unlawful or prevent processing on another lawful basis.'],
      ['6. Sharing and recipients', 'Information is shared only as needed with the other party to a listing, booking or request; Supabase and other hosting, database, authentication and storage providers; Paystack or the payment provider used for a transaction; identity or social-login providers you choose; and professional advisers, regulators, law enforcement or other recipients where required or permitted by law. Live location is visible only to the renter and provider on the booking for which the user explicitly enabled sharing. We do not sell personal information. Providers receive only information needed to respond to or perform the requested service.'],
      ['7. Cross-border processing', 'Some service providers may process or store information outside South Africa. Where this happens, the operator should use safeguards required by POPIA, including appropriate contractual or other protections. Ask support for information about the current hosting and provider locations.'],
      ['8. Retention', 'We keep information only for as long as reasonably necessary for the purposes described, including account operation, bookings, support, security, dispute resolution and legal or accounting obligations. Live location sharing stops when you stop sharing, leave the Live Tracking screen or the app goes into the background. Only the latest coordinate from each participant is stored; it is deleted when sharing stops or the booking ends. If the app or network disconnects unexpectedly, the last location is no longer displayed after two minutes and is removed when the booking ends. Other retention periods vary by information type and applicable law. Deleting an account may not immediately remove records that must be retained or information held independently by another user or service provider.'],
      ['9. Security', 'We use access controls and service-provider safeguards intended to protect personal information. No internet transmission or storage system can be guaranteed completely secure. Protect your password, sign out on shared devices, and report suspected account compromise promptly.'],
      ['10. Your rights and choices', 'Subject to applicable law, you may request access to or correction of your information, ask about processing, object to or restrict certain processing, withdraw consent where consent is the basis, request deletion where appropriate, or complain to the Information Regulator of South Africa. We may need to verify your identity and may explain legal limits or refuse a request where the law permits. You can update profile details in the app and request account deletion in Settings.'],
      ['11. Children', 'The Platform is intended for people aged 18 and over and is not directed to children. Do not create an account for a child or submit a child’s personal information. If you believe a child’s information has been provided, contact support so it can be reviewed.'],
      ['12. Updates and contact', `We may revise this policy as the service or law changes. Effective version: ${PRIVACY_VERSION}. ${SUPPORT_EMAIL || SUPPORT_PHONE ? 'Use the configured support contact in Help & Support to submit a privacy request.' : 'A working privacy-request contact and Information Officer details must be configured by the operator before public launch.'}`],
    ],
  },
  {
    id: 'cancellation',
    label: 'Cancellation & Refunds',
    title: 'Cancellation & Refunds',
    icon: 'calendar-outline',
    sections: [
      ['Before booking', 'Review the listing and booking summary carefully. Check the provider’s cancellation window, refund terms, deposit, insurance excess, mileage, pickup and return conditions before paying or confirming. Ask the provider to clarify anything that is not clear in writing.'],
      ['Cancelling or changing a booking', 'Use the booking controls in the app where available and contact the provider promptly. A cancellation request is not complete until the app or provider confirms it. For date, vehicle or itinerary changes, obtain the provider’s agreement and any price adjustment before relying on the change.'],
      ['Refunds', 'Refund amounts and eligibility depend on the terms shown for that booking, the reason for cancellation, provider acceptance and applicable law. Approved refunds are returned through the original payment route where supported. Payment processors and banks control processing times; the app cannot guarantee a specific posting date. Contact support if an approved refund has not arrived after the provider’s stated processing period.'],
      ['Provider cancellation or service failure', 'If the provider cancels, does not arrive, supplies a materially different service or raises an urgent safety concern, contact the provider and support promptly and keep relevant messages and receipts. Do not continue an unsafe trip. Statutory consumer remedies remain available where applicable.'],
      ['No-shows and disputes', 'A missed pickup, late return or failure to provide accurate trip details may result in charges under the booking agreement. Raise a dispute promptly with supporting information. The Platform may facilitate communication but does not replace a court, regulator or payment-provider dispute process.'],
      ['Important', 'There is no single cancellation percentage or refund period that applies to every booking. The specific terms shown and agreed for your booking control, subject always to non-waivable legal rights.'],
    ],
  },
  {
    id: 'community',
    label: 'Safety & Listing Standards',
    title: 'Safety & Listing Standards',
    icon: 'people-outline',
    sections: [
      ['Accurate information', 'Use current, truthful details and photographs. Providers must have authority to offer the vehicle or service and disclose material restrictions, condition, price, location, insurance limitations and availability. Customers must give accurate pickup, destination, date and passenger or cargo details.'],
      ['Respect and lawful conduct', 'Treat other users respectfully. Threats, discrimination, harassment, scams, impersonation, illegal goods or services, and attempts to take payment by deception are not permitted. Do not use the Platform to evade law enforcement or safety requirements.'],
      ['Safety first', 'Before travel, verify the provider, vehicle, licence and any required insurance or permits. Do not share passwords, one-time codes or complete payment through an unexpected link. Keep agreements and payment records in the Platform where possible. Contact emergency services for immediate danger.'],
      ['Reporting', 'Report suspected fraud, unsafe vehicles, inaccurate listings or abusive content through the available in-app reporting or support channels. Provide enough detail for review, but do not post another person’s sensitive information publicly. We may investigate and take proportionate steps, including removing content or restricting access.'],
    ],
  },
  {
    id: 'cookies',
    label: 'Cookies & App Data',
    title: 'Cookies & App Data',
    icon: 'phone-portrait-outline',
    sections: [
      ['Essential storage', 'The web app and mobile app may use cookies, local storage or equivalent device storage to keep you signed in, maintain security, remember essential preferences and complete authentication or payment redirects. Blocking essential storage may prevent sign-in or checkout from working.'],
      ['Third-party services', 'When you use social sign-in or payment features, the relevant provider may use its own cookies or similar technologies under its privacy policy. The Platform does not control those technologies.'],
      ['Optional analytics and advertising', 'Optional analytics or advertising technologies should only be enabled in a production release with appropriate disclosure and any consent required by applicable law. This version does not promise that such optional technologies are present or absent in every deployment; the operator should keep this notice aligned with the actual release configuration.'],
      ['Managing storage', 'You can clear cookies or app data in your browser or device settings. Doing so may sign you out or remove saved local preferences. Account information stored in the service is not deleted merely by clearing local browser data.'],
    ],
  },
  {
    id: 'about',
    label: 'About LexRidesZA',
    title: 'About LexRidesZA',
    icon: 'information-circle-outline',
    sections: [
      ['Our purpose', 'LexRidesZA is a South Africa-focused mobility marketplace designed to make it easier to discover vehicle rentals and request transport services. The app brings customers and independent providers together through listings, booking tools, transport requests and in-app communication.'],
      ['How it works', 'Customers can explore vehicle listings, review details and request bookings. Providers can publish vehicle listings and manage requests. Customers can also post a transport job so providers can respond. Availability, service delivery, vehicle condition, insurance and provider commitments remain the responsibility of the relevant provider unless the app expressly states otherwise.'],
      ['Our approach', 'We aim to make transport information easier to find, communicate clearly about platform features and support safer interactions. We encourage users to provide accurate information, review booking terms before confirming and report safety or conduct concerns.'],
      ['Company and contact information', `LexRidesZA is the product name. The legal operating entity, registration details and formal business address were not supplied in the app configuration and should be added by the operator before public launch. ${SUPPORT_EMAIL || SUPPORT_PHONE ? 'Support contacts are available in Help & Support.' : 'Support contact details are not configured in this build.'}`],
      ['Service status', 'Features may vary by release, location and provider. Payment and identity features are subject to the configuration of the relevant third-party providers. See the Terms of Service, Privacy Policy and Cancellation & Refunds for more information.'],
    ],
  },
];

export default function LegalInformationScreen({ navigation, route }) {
  const [documentId, setDocumentId] = useState(route.params?.document || 'terms');
  const document = DOCUMENTS.find((item) => item.id === documentId) || DOCUMENTS[0];

  useEffect(() => {
    const nextDocumentId = route.params?.document;
    if (nextDocumentId && DOCUMENTS.some((item) => item.id === nextDocumentId)) {
      setDocumentId(nextDocumentId);
    }
  }, [route.params?.document]);

  function selectDocument(id) {
    setDocumentId(id);
    navigation.setParams({ document: id });
  }

  return (
    <View style={styles.container}>
      <Header title={document.title} subtitle={`Version ${documentId === 'privacy' ? PRIVACY_VERSION : TERMS_VERSION}`} onBack={() => navigation.goBack()} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs} contentContainerStyle={styles.tabContent}>
        {DOCUMENTS.map((item) => (
          <TouchableOpacity
            key={item.id}
            accessibilityRole="tab"
            accessibilityState={{ selected: documentId === item.id }}
            style={[styles.tab, documentId === item.id && styles.activeTab]}
            onPress={() => selectDocument(item.id)}
          >
            <Text style={[styles.tabText, documentId === item.id && styles.activeTabText]}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.notice}>
          <Ionicons name={document.icon} size={20} color={colors.skyBottom} />
          <Text style={styles.noticeText}>
            LexRidesZA · Effective {documentId === 'privacy' ? PRIVACY_VERSION : TERMS_VERSION}. Review the sections below before accepting or using the service.
          </Text>
        </View>
        {document.sections.map(([heading, body]) => (
          <View key={heading} style={styles.section}>
            <Text style={styles.heading}>{heading}</Text>
            <Text style={styles.body}>{body}</Text>
          </View>
        ))}
        <Text style={styles.footer}>
          These in-app documents describe the current service and are not a substitute for advice on your specific circumstances. The operator should obtain South African legal review and complete the identified business and privacy contact details before public launch.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  tabs: { flexGrow: 0, maxHeight: 54, backgroundColor: colors.surface },
  tabContent: { paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  tab: { paddingHorizontal: 13, paddingVertical: 9, borderRadius: 999, backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.hairline },
  activeTab: { backgroundColor: colors.skyBottom, borderColor: colors.skyBottom },
  tabText: { color: colors.inkSoft, fontFamily: fonts.bodySemi, fontSize: 11.5 },
  activeTabText: { color: '#FFFFFF' },
  content: { padding: 18, paddingBottom: 36 },
  notice: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: radius.md, backgroundColor: colors.blueBg, marginBottom: 12 },
  noticeText: { flex: 1, color: colors.inkSoft, fontFamily: fonts.body, fontSize: 12, lineHeight: 18 },
  section: { padding: 15, backgroundColor: colors.surfaceAlt, borderRadius: radius.md, marginTop: 10, borderWidth: 1, borderColor: colors.hairline },
  heading: { color: colors.ink, fontFamily: fonts.bodySemi, fontSize: 14, marginBottom: 7 },
  body: { color: colors.inkSoft, fontFamily: fonts.body, fontSize: 12.5, lineHeight: 19 },
  footer: { color: colors.muted, fontFamily: fonts.body, fontSize: 11.5, lineHeight: 17, marginTop: 18, paddingHorizontal: 2 },
});
