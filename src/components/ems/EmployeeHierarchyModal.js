import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Avatar,
  IconButton,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Close as CloseIcon,
  AccountTree as AccountTreeIcon
} from '@mui/icons-material';
import { Tree, TreeNode } from 'react-organizational-chart';
import { useNavigate } from 'react-router-dom';

// API
import { getEmployees, getEmployee, getOccupationLevels } from '../api-services/employeeService';

const EmployeeHierarchyModal = ({ open, onClose }) => {
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [occupationLevels, setOccupationLevels] = useState([]);
  const [profileUrlMap, setProfileUrlMap] = useState({}); // id -> url | null
  const [imgErrorMap, setImgErrorMap] = useState({});     // id -> true if image failed
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchingIdsRef = useRef(new Set()); // prevent duplicate fetches

  useEffect(() => {
    if (!open) return;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [emps, levels] = await Promise.allSettled([
          getEmployees(),
          getOccupationLevels()
        ]);

        if (emps.status === 'fulfilled' && Array.isArray(emps.value)) {
          setEmployees(emps.value);

          // Seed any existing image URLs from the list
          const seeded = {};
          emps.value.forEach(e => {
            if (e.id && e.profileImageUrl) seeded[e.id] = e.profileImageUrl;
          });
          if (Object.keys(seeded).length) {
            setProfileUrlMap(prev => ({ ...seeded, ...prev }));
          }
        } else {
          setEmployees([]);
        }

        if (levels.status === 'fulfilled' && Array.isArray(levels.value)) {
          setOccupationLevels(levels.value);
        } else {
          setOccupationLevels([]);
        }
      } catch (e) {
        console.error(e);
        setError('Failed to load employee hierarchy data. Please try again.');
      } finally {
        setLoading(false);
      }
    })();
  }, [open]);

  // Lazy-fetch missing profile images
  useEffect(() => {
    if (!employees.length) return;

    const missing = employees.filter(
      e =>
        e.id &&
        !profileUrlMap[e.id] &&
        !fetchingIdsRef.current.has(e.id) &&
        !imgErrorMap[e.id]
    );
    if (!missing.length) return;

    const CONCURRENCY = 5;
    const queue = [...missing];

    const runBatch = async () => {
      const batch = queue.splice(0, CONCURRENCY);
      await Promise.allSettled(
        batch.map(async emp => {
          try {
            fetchingIdsRef.current.add(emp.id);
            const full = await getEmployee(emp.id);
            const url = full?.profileImageUrl || null;
            setProfileUrlMap(prev => ({ ...prev, [emp.id]: url }));
          } catch {
            // ignore; fallback to initials will handle it
          } finally {
            fetchingIdsRef.current.delete(emp.id);
          }
        })
      );
      if (queue.length) await runBatch();
    };

    runBatch();
  }, [employees, profileUrlMap, imgErrorMap]);

  // -------- helpers --------
  const toNum = (v, def = 99) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : def;
  };

  const getInitials = (firstName, lastName) =>
    `${(firstName || '').charAt(0)}${(lastName || '').charAt(0)}`.toUpperCase();

  const getLevelColor = (rank) => {
    const colors = {
      1: '#45B7D1', 2: '#45B7D1', 3: '#45B7D1', 4: '#45B7D1', 5: '#45B7D1',
      6: '#45B7D1', 7: '#45B7D1', 8: '#45B7D1', 9: '#45B7D1', 10: '#85C1E9',
      11: '#F8C471', 12: '#82E0AA', 13: '#F1948A', 14: '#D2B4DE', 15: '#AED6F1',
      16: '#A9DFBF', 17: '#F9E79F'
    };
    return colors[rank] || '#E0E0E0';
  };

  const EmployeeCard = ({ emp }) => {
    const rank = toNum(emp.occupationLevelRank, 99);
    const color = getLevelColor(rank);

    const resolvedUrl = profileUrlMap[emp.id] ?? emp.profileImageUrl ?? null;
    const showInitials = imgErrorMap[emp.id] || !resolvedUrl;
    const onImgError = () => setImgErrorMap(prev => ({ ...prev, [emp.id]: true }));

    return (
      <Box
        onClick={() => navigate(`/employee-management-system/employees/details/${emp.id}`)}
        sx={{
          p: 1.5,
          borderRadius: '12px',
          display: 'inline-block',
          border: `2px solid ${color}`,
          background: '#fff',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          minWidth: 190,
          maxWidth: 230,
          textAlign: 'center',
          transition: 'all 0.25s ease',
          cursor: 'pointer',
          '&:hover': {
            transform: 'translateY(-6px)',
            boxShadow: '0 12px 28px rgba(0,0,0,0.25)'
          }
        }}
      >
        <Avatar
          sx={{
            width: 56,
            height: 56,
            mb: 1,
            mx: 'auto',
            bgcolor: showInitials ? color : 'transparent',
            color: '#fff',
            fontWeight: 700,
            overflow: 'hidden'
          }}
        >
          {showInitials ? (
            getInitials(emp.firstName, emp.lastName)
          ) : (
            <img
              src={resolvedUrl}
              alt={`${emp.firstName || ''} ${emp.lastName || ''}`}
              onError={onImgError}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '50%',
                display: 'block'
              }}
            />
          )}
        </Avatar>

        <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.15 }}>
          {`${emp.firstName || ''} ${emp.lastName || ''}`.trim()}
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          {emp.occupationName || 'N/A'}
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          {emp.subDepartmentName || 'N/A'}
        </Typography>
      </Box>
    );
  };

  // -------- hierarchy (no hard-coded ranks) --------
  const tree = useMemo(() => {
    if (!employees.length) return null;

    const emps = employees
      .map(e => ({
        ...e,
        _rank: toNum(e.occupationLevelRank, 99),
        departmentName: e.departmentName || 'Unknown Department',
        subDepartmentName: e.subDepartmentName || 'Unknown Sub-department'
      }))
      .sort((a, b) => a._rank - b._rank);

    const minRank = emps[0]?._rank ?? 99;
    const topLevel = emps.filter(e => e._rank === minRank);

    const makeNode = (emp) => ({ emp, children: [] });
    const nodeMap = new Map();
    emps.forEach(e => nodeMap.set(e.id, makeNode(e)));

    let rootNode;
    if (topLevel.length === 1) {
      rootNode = nodeMap.get(topLevel[0].id);
    } else {
      rootNode = {
        emp: {
          id: '__synthetic_root__',
          firstName: 'Organization',
          lastName: '',
          occupationName: '',
          subDepartmentName: '',
          occupationLevelRank: minRank,
          _rank: minRank
        },
        children: topLevel.map(e => nodeMap.get(e.id))
      };
    }

    for (const emp of emps) {
      if (topLevel.some(t => t.id === emp.id)) continue;

      const candidates = emps.filter(p =>
        p._rank < emp._rank &&
        p.departmentName === emp.departmentName &&
        p.subDepartmentName === emp.subDepartmentName
      );

      let parentNode;
      if (candidates.length) {
        const closestRank = Math.max(...candidates.map(c => c._rank));
        const parentEmp = candidates.find(c => c._rank === closestRank);
        parentNode = nodeMap.get(parentEmp.id);
      } else {
        parentNode = rootNode;
      }

      parentNode.children.push(nodeMap.get(emp.id));
    }

    const renderNode = (node) => {
      if (!node.children.length) return <EmployeeCard emp={node.emp} />;
      return (
        <Tree
          lineWidth="2px"
          lineColor="#000000"
          lineBorderRadius="8px"
          label={<EmployeeCard emp={node.emp} />}
        >
          {node.children
            .sort((a, b) => a.emp._rank - b.emp._rank || String(a.emp.lastName).localeCompare(String(b.emp.lastName)))
            .map(child => (
              <TreeNode
                key={child.emp.id || `${child.emp.firstName}-${child.emp.lastName}-${child.emp.staffCardID}`}
                label={renderNode(child)}
              />
            ))}
        </Tree>
      );
    };

    if (rootNode.emp.id === '__synthetic_root__') {
      return (
        <Tree lineWidth="0px" lineColor="#ddd" lineBorderRadius="8px" label={<EmployeeCard emp={rootNode.emp} />}>
          {rootNode.children.map(child => (
            <TreeNode
              key={child.emp.id || `${child.emp.firstName}-${child.emp.lastName}-${child.emp.staffCardID}`}
              label={renderNode(child)}
            />
          ))}
        </Tree>
      );
    }

    return renderNode(rootNode);
  }, [employees, profileUrlMap, imgErrorMap]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      // GLASS EFFECT
      PaperProps={{
        sx: {
          height: '90vh',
          maxHeight: '90vh',
          // translucent glassy panel
          bgcolor: 'rgba(255,255,255,0.12)',
          backgroundImage: 'linear-gradient(135deg, rgba(52,199,89,0.12), rgba(40,167,69,0.08))',
          backdropFilter: 'blur(18px) saturate(140%)',
          WebkitBackdropFilter: 'blur(18px) saturate(140%)',
          border: '1px solid rgba(255,255,255,0.25)',
          borderRadius: 3,
          boxShadow: '0 24px 60px rgba(0,0,0,0.35)'
        }
      }}
      BackdropProps={{
        sx: {
          // slightly tinted, blurred backdrop so content behind feels frosted
          bgcolor: 'rgba(2,6,23,0.45)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)'
        }
      }}
    >
      <DialogTitle
        // GLASSY HEADER
        sx={{
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          py: 1.5,
          px: 2,
          background:
            'linear-gradient(180deg, rgba(52,199,89,0.28) 0%, rgba(52,199,89,0.12) 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.22)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <AccountTreeIcon />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Employee Hierarchy
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, bgcolor: 'transparent' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 420 }}>
            <CircularProgress size={60} />
          </Box>
        ) : error ? (
          <Box sx={{ p: 3 }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        ) : (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              p: 3,
              minHeight: 420,
              overflow: 'auto',
              bgcolor: 'transparent'
            }}
          >
            {tree}
          </Box>
        )}
      </DialogContent>

      {/* Optional footer glass strip – uncomment if you add actions later
      <DialogActions
        sx={{
          px: 2, py: 1.5, justifyContent: 'flex-end',
          background: 'linear-gradient(0deg, rgba(52,199,89,0.18), rgba(52,199,89,0.08))',
          borderTop: '1px solid rgba(255,255,255,0.22)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)'
        }}
      >
        <Button variant="contained">Close</Button>
      </DialogActions>
      */}
    </Dialog>
  );
};

export default EmployeeHierarchyModal;
