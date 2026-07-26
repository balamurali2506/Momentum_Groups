import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#F9F3E7',
    padding: 40,
  },
  container: {
    flex: 1,
    border: '4px solid #d97706',
    borderRadius: 10,
    padding: 40,
    backgroundColor: '#ffffff',
  },
  header: {
    textAlign: 'center',
    marginBottom: 30,
  },
  logo: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#d97706',
    marginBottom: 10,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1c1917',
    marginBottom: 10,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#78716c',
    marginBottom: 40,
  },
  body: {
    alignItems: 'center',
    marginVertical: 30,
  },
  certifiesText: {
    fontSize: 16,
    color: '#44403c',
    marginBottom: 20,
    textAlign: 'center',
  },
  studentName: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#d97706',
    borderBottom: '2px solid #d97706',
    paddingBottom: 10,
    marginBottom: 30,
    paddingHorizontal: 40,
  },
  courseText: {
    fontSize: 16,
    color: '#44403c',
    textAlign: 'center',
    marginBottom: 10,
  },
  courseName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1c1917',
    textAlign: 'center',
    marginBottom: 40,
  },
  description: {
    fontSize: 12,
    color: '#78716c',
    textAlign: 'center',
    lineHeight: 1.6,
    paddingHorizontal: 60,
    marginBottom: 40,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 'auto',
    paddingHorizontal: 40,
    paddingTop: 40,
    borderTop: '1px solid #e7e5e4',
  },
  signatureBlock: {
    alignItems: 'center',
  },
  signatureLine: {
    width: 150,
    height: 1,
    backgroundColor: '#44403c',
    marginBottom: 10,
  },
  signatureName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1c1917',
    marginBottom: 4,
  },
  signatureTitle: {
    fontSize: 10,
    color: '#78716c',
  },
  dateSection: {
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 10,
    color: '#78716c',
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1c1917',
  },
  badge: {
    position: 'absolute',
    top: 40,
    right: 40,
    width: 80,
    height: 80,
    backgroundColor: '#d97706',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

// Create Document Component
export default function CertificatePDF({ userName, courseTitle, date }) {
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.container}>
          
          {/* Certificate Badge */}
          <View style={styles.badge}>
            <Text style={styles.badgeText}>CERTIFIED</Text>
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.logo}>M</Text>
            <Text style={styles.title}>CERTIFICATE</Text>
            <Text style={styles.title}>OF COMPLETION</Text>
            <Text style={styles.subtitle}>This is to certify that</Text>
          </View>

          {/* Body */}
          <View style={styles.body}>
            <Text style={styles.studentName}>{userName}</Text>
            
            <Text style={styles.courseText}>has successfully completed the course</Text>
            <Text style={styles.courseName}>{courseTitle}</Text>
            
            <Text style={styles.description}>
              This training provided comprehensive knowledge and practical skills, 
              enhancing professional development and expertise in the subject matter.
            </Text>
          </View>

          {/* Footer with Signatures */}
          <View style={styles.footer}>
            <View style={styles.dateSection}>
              <Text style={styles.dateLabel}>Date Issued</Text>
              <Text style={styles.dateValue}>{date}</Text>
            </View>

            <View style={styles.signatureBlock}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureName}>Manraaj Singh Mand</Text>
              <Text style={styles.signatureTitle}>Co-Founder & CEO</Text>
            </View>

            <View style={styles.signatureBlock}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureName}>Ranhjot Singh Mand</Text>
              <Text style={styles.signatureTitle}>Co-Founder & CTO</Text>
            </View>
          </View>

        </View>
      </Page>
    </Document>
  );
}