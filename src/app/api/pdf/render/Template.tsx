import * as React from "react"
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Svg,
  Font,
} from "@react-pdf/renderer"
import { JobPost } from "@actions/jobpost"

import { renderHTML } from "@components/tiptap-renderer"
import Html from "react-pdf-html"
import { getCurrencySymbol, formatCurrency } from "@/utils/formatCurrency"
import { getSeniorityLabel } from "@/utils/seniorityMapper"
import { Organization } from "@/app/home/org/actions"
import { getImageUrl } from "@utils/image"
// const geistSans = localFont({
//   src: "./fonts/GeistVF.woff",
//   variable: "--font-geist-sans",
//   weight: "100 900",
// })

const styling = {
  Paragraph:
    "margin:0px; padding:0px; max-width: 90%; font-size: 11px; font-family: Geist",
  Text: "color: #000; font-weight: normal",
  Bold: "font-weight: 600",
  ListItem:
    "font-size: 12px; margin-top: 1px; margin-bottom: 0; margin-left:-10; padding-left:0;",
  BulletList:
    "font-size: 12px; margin-top: 0; margin-bottom: 0;  margin-left:-10; padding-left:0;",
  Heading:
    "font-size: 14px; font-weight: bold; margin-top: 5px; margin-bottom: 5px",
}
// import House from "lucide-static/icons/house.svg"
// import source from "./fonts/GeistVF.woff"
// Font.register({
//   family: "Geist",
//   src: "https://fonts.gstatic.com/s/geist/v1/gyByhwUxId8gMEwSGFWNOITddY4.woff2",
// })

Font.register({
  family: "Geist",
  format: "woff2",
  fonts: [100, 200, 300, 400, 500, 600, 700, 800, 900].map((weight) => ({
    src: `https://cdn.jsdelivr.net/fontsource/fonts/geist-sans@latest/latin-${weight}-normal.woff2`,
    fontWeight: weight,
    format: "woff2",
  })),
})

const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontFamily: "Geist",
    color: "#454545",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "Geist",
  },
  smallTitle: {
    fontSize: 14,
    fontWeight: "semibold",
    fontFamily: "Geist",
  },
  text: {
    fontSize: 11,
    fontWeight: "normal",
    fontFamily: "Geist",
  },
  leftColumn: {
    width: "70%",
  },
  rightColumn: {
    width: "30%",
  },
  row: {
    display: "flex",
    flexDirection: "row",
    // alignItems: "center",
  },
  card: {
    marginTop: 10,
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 5,
  },
  cardRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bold: {
    fontSize: 11,
    fontFamily: "Geist",
    fontWeight: 700,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#000",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarText: {
    fontSize: 11,
    fontWeight: "normal",
    fontFamily: "Geist",
    color: "#fff",
  },
  lightText: {
    fontSize: 11,
    fontWeight: "light",
    fontFamily: "Geist",
    opacity: 0.5,
  },
  image: {
    width: 100,
    height: 100,
  },
})

const JobInfo = ({
  title,
  value,
}: {
  title: string
  value: boolean | null | string
}) => {
  return (
    <View style={styles.cardRow}>
      <Text style={styles.text}>{title}: </Text>
      <Text style={{ ...styles.text, marginLeft: "2px" }}>
        {typeof value === "boolean" ? (value ? "Yes" : "No") : value}
      </Text>
    </View>
  )
}

const SalaryInfo = ({
  minSalary,
  maxSalary,
  currencyCode,
}: {
  minSalary: number | null
  maxSalary: number | null
  currencyCode: string | null
}) => {
  return minSalary || maxSalary ? (
    <View style={styles.cardRow}>
      <Text style={styles.text}>
        {minSalary && maxSalary
          ? "Salary:"
          : minSalary
          ? "Salary from:"
          : "Salary:"}
      </Text>
      <Text style={[styles.text, styles.bold]}>
        {minSalary ? formatCurrency(minSalary) : ""}
        {minSalary && maxSalary ? " - " : ""}
        {maxSalary ? formatCurrency(maxSalary) : ""}
        {getCurrencySymbol(currencyCode || "")}
      </Text>
    </View>
  ) : null
}

const Avatar = ({
  organization,
  logo,
}: {
  organization: Organization
  logo?: string
}) => {
  const imageUrl = organization.image
    ? getImageUrl(organization.image || "")
    : null
  console.log(imageUrl)
  return (
    <View style={styles.avatar}>
      {imageUrl ? (
        <Image
          src={imageUrl}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      ) : (
        <Text style={styles.avatarText}>
          {organization.name.charAt(0)}
          {organization.name.charAt(1)}
        </Text>
      )}
    </View>
  )
}

const OrganizationInfo = ({ organization }: { organization: Organization }) => {
  return (
    <View
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginVertical: 10,
      }}
    >
      <Avatar organization={organization} />
      <View>
        <Text style={styles.smallTitle}>{organization.name}</Text>

        <Text style={styles.lightText}>
          {organization.city.name}, {organization?.city?.country?.name}
        </Text>
      </View>
    </View>
  )
}

const createTemplate = async ({ jobPost }: { jobPost: JobPost }) => {
  const content = renderHTML({ json: jobPost.description || "", styling })
  return (
    <Document>
      <Page size={"A4"} style={styles.page}>
        {jobPost.organization && (
          <OrganizationInfo organization={jobPost.organization} />
        )}
        <View style={{ marginBottom: 20 }}>
          <Text style={styles.title}>{jobPost.title}</Text>
        </View>
        <View style={styles.row}>
          <View style={styles.leftColumn}>
            <Html style={[{ marginTop: -10 }]}>{content}</Html>
          </View>
          <View style={styles.rightColumn}>
            <View style={styles.cardRow}>
              <Text style={styles.text}>Seniority: </Text>
              <Text style={styles.bold}>
                {getSeniorityLabel((jobPost?.seniority as number) || 0).key}
              </Text>
            </View>
            <SalaryInfo
              minSalary={jobPost.minSalary}
              maxSalary={jobPost.maxSalary}
              currencyCode={jobPost.currency?.code || "USD"}
            />
            <View style={[styles.card, { gap: 2 }]}>
              <Text style={[styles.bold, { marginBottom: 10 }]}>
                Job details
              </Text>
              <JobInfo title="Job type" value={jobPost.type} />
              <JobInfo title="Remote" value={jobPost.remote} />
              <JobInfo title="Hybrid" value={jobPost.hybrid} />
              <JobInfo title="Consulting" value={jobPost.consulting} />
              <JobInfo title="Equity" value={jobPost.equity} />
            </View>
          </View>
        </View>
      </Page>
    </Document>
  )
}

export default createTemplate
