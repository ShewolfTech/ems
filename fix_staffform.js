const fs = require('fs');
const fpath = 'C:/Bright/ems/frontend/src/components/domains/staffmgt/staff/StaffForm.tsx';
let content = fs.readFileSync(fpath, 'utf8');
if (!content.includes('usingFallbackEmploymentTypes')) {
  content = content.replace(
    'const [activeTab, setActiveTab] = useState<TabType>(\"personal\");',
    'const [activeTab, setActiveTab] = useState<TabType>(\"personal\");\n  const [usingFallbackEmploymentTypes, setUsingFallbackEmploymentTypes] = useState(false);'
  );
  fs.writeFileSync(fpath, content, 'utf8');
  console.log('Added usingFallbackEmploymentTypes state');
} else {
  console.log('Already has usingFallbackEmploymentTypes');
}
