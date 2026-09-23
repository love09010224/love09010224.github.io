/**
 * Portfolio content. Edit this file to update the site.
 * Biography / results / handles: https://velog.io/@love09010224/about
 * Education and activity dates: supplied by Seojin, September 2026.
 * Empty roles are intentional and are not rendered.
 */
export const profile = {
  name: 'Seojin An',
  handle: 'love09010224.github.io',
  alias: 'isitanickname',
  title: 'Vulnerability Researcher',
  university: 'University of Seoul',
  introduction:
    '서울시립대학교 컴퓨터과학부에 재학 중인 취약점 연구자입니다. 시스템 해킹과 리버스 엔지니어링을 중심으로 공부하며, Linux Kernel LPE와 오픈소스 버그바운티에 관심이 있습니다.',
  github: 'https://github.com/love09010224',
  velog: 'https://velog.io/@love09010224',
  ctftime: 'https://ctftime.org/user/254082',
  discord: 'anseojin3235',
  email: 'love09010224@uos.ac.kr',
};

export const skills = [
  { category: 'Security', items: ['System Hacking', 'Reverse Engineering', 'Bug Bounty'] },
  { category: 'Languages', items: ['Python', 'C', 'C++', 'Java', 'TypeScript'] },
  { category: 'Frontend', items: ['React', 'Next'] },
  { category: 'Backend', items: ['Express', 'SpringBoot'] },
  { category: 'Databases', items: ['MySQL', 'MongoDB'] },
];

export const education = [
  { school: '서울시립대학교', department: '컴퓨터과학부', start: '2025.03', end: '' },
  { school: '한국디지털미디어고등학교', department: '웹프로그래밍과', start: '2022.03', end: '2025.02' },
];

export interface CtfResult {
  event: string;
  year: number | null;
  place: number;
  team: string;
  division?: string;
  featured: boolean;
}

export const results: CtfResult[] = [
  { event: 'ACTF', year: 2026, place: 1, team: '따따', featured: true },
  { event: 'TJCTF', year: 2026, place: 1, team: "Jinddabi’s", featured: true },
  { event: 'DEF CON 34 Final', year: 2026, place: 7, team: "Jinddabi’s", featured: true },
  { event: 'SCTF', year: 2026, place: 1, team: '따따', featured: true },
  { event: 'Hacktheon Sejong Final', year: 2026, place: 2, team: 'SHA-4', division: 'Beginner', featured: true },
  { event: 'Codegate Final', year: 2026, place: 2, team: '따따', division: 'General', featured: true },
  { event: 'DiceCTF Quals', year: 2026, place: 5, team: '따따', featured: false },
  { event: 'Black Hat MEA CTF Quals', year: 2026, place: 1, team: '따따', featured: false },
  { event: '1st KISIA CTF Final', year: 2026, place: 10, team: 'UOS-SHA', featured: false }, // Year not specified in the source.
  { event: 'SekaiCTF', year: 2026, place: 7, team: "Jinddabi’s", featured: false },
  { event: 'TFCCTF', year: 2026, place: 10, team: 'seojin fan club', featured: false },
  { event: 'SAS CTF Quals', year: 2026, place: 5, team: '따따', featured: false },
  { event: 'CCE Final', year: 2026, place: 8, team: '이성민남친구함', division: 'General', featured: false },
];

export const vulnerabilities = [
  {
    id: 'CVE-2026-47193',
    product: 'OpenProject',
    title: 'Journal diff visibility bypass',
    summary: '객체·저널·필드의 공개 범위 검증 누락으로 인한 정보 노출.',
    url: 'https://www.cve.org/CVERecord?id=CVE-2026-47193',
    advisory: 'https://github.com/opf/openproject/security/advisories/GHSA-f2rx-x2qj-2hgj',
  },
  {
    id: 'CVE-2026-52779',
    product: 'OpenProject',
    title: 'Cross-project authorization bypass',
    summary: 'Calendar 및 Team Planner의 프로젝트 간 권한 검증 오류.',
    url: 'https://www.cve.org/CVERecord?id=CVE-2026-52779',
    advisory: 'https://github.com/opf/openproject/security/advisories/GHSA-jrx5-px3f-vfq4',
  },
];

export const projects = [
  {
    name: 'Room Escape CTF (Sponsered by HSPACE)',
    subtitle: '주말에 뭐하세요? 바쁘세요? 해결 가능하신가요?',
    year: '2026',
    role: '',
    description: 'AI의 발전에 따라 한계에 부딪힌 기존의 정적인 문제 풀이 대회에서 벗어나, 참가자들이 직접 "불법 사설 탐정"이 되어 발로 뛰며 문제를 탐색하고 해결하는 방탈출 요소를 결합한 실전형 CTF입니다. 리눅스 커널 해킹문제를 포함한 2개 문제의 출제, 인증 시스템과 소통 플랫폼 구축 등을 포함한 대회 인프라 구성, 서버 트래픽 관리와 참가자 문의 응답을 수행하였습니다.',
    url: '',
  },
];

export const work = [
  {
    organization: '버비컴퍼니',
    start: '2025.09',
    end: '',
    role: '사내 DB 재구축 및 관리 프로그램 제작 / React & SpringBoot를 활용한 홈페이지 풀스택 협업', // Add your job title here when ready.
    description: '',
  },
];

export const activities = [
  { organization: '서울시립대학교 보안소모임 SHA', type: 'Security', start: '2025.03', end: '' },
  { organization: '서울시립대학교 암호동아리 Doorlock', type: 'Cryptography', start: '2026.09', end: '' },
  { organization: '따따', type: '(a.k.a dda_com, dda.com) CTF Team', start: '2026.04', end: '' },
];
