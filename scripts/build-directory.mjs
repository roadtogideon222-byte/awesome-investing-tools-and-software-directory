import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const README_PATH = resolve(ROOT, "README.md");

const GROUPS = [
	{
		title: "Filings and Transcripts",
		emoji: "🧾",
		categories: [
			"Improved Filings",
			"Diff View",
			"Filing Sentiment",
			"Transcripts",
			"Earnings Calls Sentiment",
		],
	},
	{
		title: "Ownership and Corporate Activity",
		emoji: "👥",
		categories: [
			"Insider Data",
			"Institutional Ownership",
			"US Government Trades",
			"Short Interest",
			"Corporate Actions & Special Situations",
			"IPO",
			"Guidance / Pre-announcements",
			"Dividends",
			"Splits",
			"Which ETF includes this Stock?",
		],
	},
	{
		title: "ETFs and Funds",
		emoji: "🧺",
		categories: [
			"ETF Analysis",
			"ETF Comparison",
			"ETF Factors",
			"ETF Overlap",
			"ETF Screeners",
			"Fund Analysis",
			"Index Rebalancing",
		],
	},
	{
		title: "Crypto and On-chain",
		emoji: "🔗",
		categories: [
			"On-chain Analytics",
			"DEX / DeFi",
			"Crypto Derivatives",
			"Wallet / Address Monitoring",
			"NFT Markets",
		],
	},
	{
		title: "Options and Derivatives",
		emoji: "⚙️",
		categories: ["Options", "Options P&L"],
	},
	{
		title: "Compliance and Tax",
		emoji: "🛡️",
		categories: [
			"Insider Compliance / Pre-clearance",
			"Restricted Lists",
			"Audit Trail / Supervision",
			"Regulatory Filings Monitoring",
			"Tax Lots / Lot Optimization",
			"Wash Sale Detection",
			"Capital Gains Estimator",
			"Dividend Tax / ADR Withholding",
			"Downloadable Tax Reports",
		],
	},
	{
		title: "Trading and Brokerage",
		emoji: "💹",
		categories: [
			"Brokerage",
			"Paper Trading",
			"Auto-Trading & Bots",
			"Advanced Order Types",
			"Smart/Direct Routing",
			"Copy/Social Trading",
			"Order Book / Level II",
			"Dark Pool & Off-Exchange",
			"Odd Lots",
			"Money Flow",
		],
	},
	{
		title: "Portfolio, Risk and Backtesting",
		emoji: "🧪",
		categories: [
			"Portfolio",
			"Watchlist",
			"Backtesting",
			"Correlation",
			"Factor Exposure",
			"Performance Attribution",
			"Risk Metrics",
			"Scenario & Stress Tests",
			"Monte Carlo",
			"Performance During Crisis",
			"Wealth Management",
			"Advisor Operations",
		],
	},
	{
		title: "Screening and Discovery",
		emoji: "🔎",
		categories: [
			"Stock Ideas",
			"Screeners",
			"Top Analysts",
			"Stock Comparison",
			"Stock Handbook",
		],
	},
	{
		title: "Automation, Data and Integrations",
		emoji: "🤖",
		categories: [
			"APIs & Data Feeds",
			"Webhooks",
			"Sheets / Excel Add-ins",
			"Zapier / Make",
			"Broker Connectors",
		],
	},
	{
		title: "Education and Community",
		emoji: "🎓",
		categories: [
			"Education",
			"Courses & Certs",
			"Playbooks & Case Studies",
			"Videos",
			"Blogs",
			"Forums",
			"Newsletters",
			"Reddit",
		],
	},
	{
		title: "Calculators",
		emoji: "🧮",
		categories: [
			"Compounding Calculator",
			"Position Sizing",
			"Retirement Calculator",
		],
	},
	{
		title: "Market Data, News and Alerts",
		emoji: "📡",
		categories: [
			"Official Sources",
			"News",
			"News Sentiment",
			"Alerts",
			"Calendar",
			"Market Sentiment",
			"Macro Data",
			"Yield Curves",
			"Real Yields",
			"Credit Ratings & Outlooks",
			"CDS Spreads",
			"MBS/ABS (Prepayments)",
			"New Issues & Calendars",
		],
	},
	{
		title: "Research and Valuation",
		emoji: "📊",
		categories: [
			"Financials",
			"Scores",
			"Flags",
			"ESG Ratings",
			"Valuation Models",
			"App & Website Traffic",
			"Checklist",
			"Data Visualizations",
			"Quant",
			"Analyst Forecasts",
			"Analyst Ratings & Price Targets",
			"Management Guidance",
			"Management Performance",
			"Management Compensation",
			"AI Research",
			"AI Chat",
			"Bulls Say Bear Say",
			"Employee/Consumer Reviews",
			"Job Postings",
			"Patents / USPTO",
			"Satellite / Geospatial",
			"Shipping & Trade",
			"Notes & Highlights",
			"PDF Annotation",
			"Citations & Source Pinning",
			"Research Templates",
			"Shared Workspaces",
			"Custom Dashboards",
		],
	},
	{ title: "Other", emoji: "✨", categories: [] },
];

function readJson(path) {
	return JSON.parse(readFileSync(resolve(ROOT, path), "utf8"));
}

function slugify(value) {
	return value
		.toLowerCase()
		.trim()
		.replace(/['’]/g, "")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

function anchor(value) {
	return value
		.toLowerCase()
		.replace(/&/g, "and")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

function headingEmoji(value) {
	// GitHub removes the emoji glyph from generated heading anchors, but a
	// variation selector can survive. Strip it so every native anchor is stable.
	return value.replace(/\uFE0F/g, "");
}

function headingAnchor(group) {
	return `-${anchor(group.title)}`;
}

function cleanText(value, maxLength = 220) {
	const clean = String(value ?? "")
		.replace(/\[\d+\]/g, "")
		.replace(/[\r\n\t]+/g, " ")
		.replace(/\*\*/g, "")
		.replace(/\s+/g, " ")
		.trim();
	if (clean.length <= maxLength) return clean;
	const cut = clean.slice(0, maxLength);
	return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), 1)).trim()}…`;
}

function validateTool(tool, source) {
	for (const field of ["name", "url", "summary"]) {
		if (!tool[field] || typeof tool[field] !== "string") {
			throw new Error(`${source}: missing ${field} for ${tool.name ?? "unknown tool"}`);
		}
	}
	if (!/^https?:\/\//.test(tool.url)) {
		throw new Error(`${source}: ${tool.name} must use an http(s) URL`);
	}
	if (!Array.isArray(tool.categories) || tool.categories.length === 0) {
		throw new Error(`${source}: ${tool.name} needs at least one category`);
	}
}

function sectionFor(tool) {
	const primaryCategory = tool.categories[0];
	return (
		GROUPS.find(
			(group) =>
				group.categories.length > 0 &&
				group.categories.includes(primaryCategory),
		) ?? GROUPS.at(-1)
	);
}

function formatDate(value) {
	return new Intl.DateTimeFormat("en", {
		month: "long",
		day: "numeric",
		year: "numeric",
		timeZone: "UTC",
	}).format(new Date(`${value}T00:00:00Z`));
}

function buildReadme() {
	const core = readJson("data/find-my-moat-tools.json");
	const community = readJson("data/community-tools.json");
	const tools = [
		...core.tools.map((tool) => ({ ...tool, source: "find-my-moat" })),
		...community.map((tool) => ({ ...tool, source: "community" })),
	];

	if (core.count !== core.tools.length) {
		throw new Error(`Core count says ${core.count}, but contains ${core.tools.length} tools`);
	}

	const seen = new Set();
	for (const tool of tools) {
		validateTool(tool, tool.source);
		const key = tool.name.toLowerCase().trim();
		if (seen.has(key)) throw new Error(`Duplicate tool name: ${tool.name}`);
		seen.add(key);
	}

	const grouped = new Map(GROUPS.map((group) => [group.title, []]));
	for (const tool of tools.sort((left, right) => left.name.localeCompare(right.name))) {
		grouped.get(sectionFor(tool).title).push(tool);
	}

	const campaign = "utm_source=github&utm_medium=referral&utm_campaign=awesome_investing_tools";
	const lines = [
		`# 📈 ${tools.length} Awesome Investing Tools & Software for Investors`,
		"",
		"> A practical, editorially curated directory of investing research tools, datasets, brokers, APIs, calculators, and communities.",
		"",
		`[**Search, filter, and compare all ${core.count} researched tools on Find My Moat →**](https://www.findmymoat.com/?${campaign}&utm_content=directory_header)`,
		"",
		`Last refreshed **${formatDate(core.exportedOn)}** from the Find My Moat research catalog.`,
		"",
		"## How this list works",
		"",
		"- Tool names link directly to each official website.",
		"- **Research profile** links open Find My Moat's notes on features, pricing, access, and alternatives.",
		"- Every tool appears once in the closest primary section, even when it supports several workflows.",
		"- Inclusion and alphabetical order are not affected by payment or commercial relationships. Some Find My Moat profiles contain clearly disclosed affiliate links; the tool-name links in this README do not.",
		"- Acquired or discontinued products are labeled in their descriptions and retained only when the history helps investors find current alternatives.",
		`- Missing something? Read [the contribution guide](CONTRIBUTING.md).`,
		"",
		"## Contents",
		"",
		"| Section | Tools |",
		"| --- | ---: |",
	];

	for (const group of GROUPS) {
		const entries = grouped.get(group.title);
		if (entries.length === 0) continue;
		lines.push(`| [${group.emoji} ${group.title}](#${headingAnchor(group)}) | ${entries.length} |`);
	}

	for (const group of GROUPS) {
		const entries = grouped.get(group.title);
		if (entries.length === 0) continue;
		lines.push(
			"",
			"---",
			"",
			`### ${headingEmoji(group.emoji)} ${group.title}`,
			"",
		);
		for (const tool of entries) {
			const name = tool.name.replace(/\[/g, "\\[").replace(/\]/g, "\\]");
			const summary = cleanText(tool.summary).replace(/\[/g, "(").replace(/\]/g, ")");
			const details =
				tool.source === "find-my-moat"
					? ` ([research profile](https://www.findmymoat.com/tools/${slugify(tool.name)}?${campaign}&utm_content=${slugify(tool.name)}))`
					: "";
			lines.push(`- [${name}](${tool.url}) — ${summary}${details}`);
		}
		lines.push("", "[Back to contents](#contents)");
	}

	lines.push(
		"",
		"---",
		"",
		"Maintained by [Find My Moat](https://www.findmymoat.com/?utm_source=github&utm_medium=referral&utm_campaign=awesome_investing_tools&utm_content=directory_footer). More from [Jera Value](https://www.jeravalue.com/en) · [@jera_value](https://x.com/jera_value).",
		"",
	);

	return lines.join("\n");
}

const output = buildReadme();
if (process.argv.includes("--check")) {
	const current = readFileSync(README_PATH, "utf8");
	if (current !== output) {
		console.error("README.md is out of date. Run: node scripts/build-directory.mjs");
		process.exitCode = 1;
	} else {
		console.log("README.md is current.");
	}
} else {
	writeFileSync(README_PATH, output);
	console.log("Updated README.md.");
}
