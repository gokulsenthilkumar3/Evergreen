import { useState, useEffect, useMemo } from 'react';
import {
    Box, Button, Card, CardContent, Chip, Typography, IconButton,
    TextField, Checkbox, FormControlLabel, Popover, InputAdornment
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import SettingsIcon from '@mui/icons-material/Settings';
import SearchIcon from '@mui/icons-material/Search';
import { http } from '../../lib/http';
import StartBatchDialog from './StartBatchDialog';
import EditBatchDialog from './EditBatchDialog';
import { notify } from '../../context/NotificationContext';
import {
    DndContext,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    defaultDropAnimationSideEffects,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
    useDraggable,
    useDroppable,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';

type Batch = {
    id: string;
    batchNumber: string;
    currentStage: string;
    status: string;
    inputQuantity: number;
    rawMaterialId: string;
    productionBatches?: any[];
    rawMaterial?: { batchNo: string; materialType: string };
};

const ALL_STAGES = [
    'PLANNED', 'MIXING', 'CARDING', 'DRAWING', 'ROVING', 'SPINNING', 'WINDING', 'COMPLETED'
];

function DraggableCard({ batch, onClickEdit }: { batch: Batch, onClickEdit: (b: Batch) => void }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: batch.id,
        data: batch
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 999 : 1,
        touchAction: 'none'
    } : undefined;

    // Use a status color
    const isCompleted = batch.status === 'COMPLETED';
    const borderColor = isCompleted ? 'var(--success-main)' : 'transparent';

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
            <Card
                className="glass-card animate-in"
                sx={{
                    borderRadius: 1,
                    mb: 1,
                    cursor: 'grab',
                    borderLeft: `4px solid ${borderColor}`,
                    '&:hover': { transform: 'translateY(-2px)', boxShadow: 2 }
                }}
            >
                <CardContent sx={{ p: '8px !important' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Typography sx={{ fontWeight: 'bold', fontSize: '0.8rem' }}>
                            {batch.batchNumber}
                        </Typography>
                        <IconButton
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent drag start on click
                                onClickEdit(batch);
                            }}
                            onPointerDown={(e) => e.stopPropagation()} // Prevent drag start 
                            sx={{ p: 0.2 }}
                        >
                            <EditIcon sx={{ fontSize: '0.8rem' }} />
                        </IconButton>
                    </Box>

                    <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary', mt: 0.5 }}>
                        RM: {batch.rawMaterial?.batchNo || 'N/A'} ({batch.inputQuantity}kg)
                    </Typography>

                    <Chip
                        label={batch.status}
                        size="small"
                        sx={{ height: 16, fontSize: '0.6rem', px: 0, mt: 1 }}
                        color={batch.status === 'COMPLETED' ? 'success' : 'primary'}
                        variant="outlined"
                    />
                </CardContent>
            </Card>
        </div>
    );
}

function DroppableColumn({ stage, batches, onEdit, compact }: { stage: string, batches: Batch[], onEdit: (b: Batch) => void, compact: boolean }) {
    const { setNodeRef } = useDroppable({
        id: stage,
    });

    const isCompleted = stage === 'COMPLETED';

    return (
        <Box ref={setNodeRef} sx={{
            minWidth: compact ? 240 : 320,
            flex: `0 0 ${compact ? 240 : 320}px`, // Fixed width for wrap
            display: 'flex',
            flexDirection: 'column',
            bgcolor: (theme) => theme.palette.mode === 'dark' ? 'background.default' : 'grey.100',
            borderRadius: 2,
            p: 1,
            height: compact ? '400px' : '600px', // Fixed height when wrapping
            maxHeight: '100%',
        }}>
            <Typography variant="caption" sx={{
                fontWeight: 'bold',
                p: 1,
                mb: 1,
                textAlign: 'center',
                background: isCompleted ? 'var(--success-gradient)' : 'var(--primary-gradient)',
                color: 'white',
                borderRadius: 1,
                boxShadow: 1
            }}>
                {stage} ({batches.length})
            </Typography>

            <Box sx={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 0 }}>
                {batches.map(b => (
                    <DraggableCard key={b.id} batch={b} onClickEdit={onEdit} />
                ))}
                {batches.length === 0 && (
                    <Box sx={{ height: 50, border: '1px dashed #ccc', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="caption" color="text.secondary">Drop here</Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );
}

export default function BatchKanban() {
    const [batches, setBatches] = useState<Batch[]>([]);
    const [openStart, setOpenStart] = useState(false);
    const [editBatch, setEditBatch] = useState<Batch | null>(null);
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const [activeDragBatch, setActiveDragBatch] = useState<Batch | null>(null);
    const [compactMode, setCompactMode] = useState(false);

    // Persistent State
    const [search, setSearch] = useState(() => localStorage.getItem('kanban_search') || '');
    const [visibleStages, setVisibleStages] = useState<string[]>(() => {
        try {
            return JSON.parse(localStorage.getItem('kanban_stages') || '[]').length > 0
                ? JSON.parse(localStorage.getItem('kanban_stages')!)
                : ALL_STAGES.slice(0, 6);
        } catch {
            return ALL_STAGES.slice(0, 6);
        }
    });

    useEffect(() => { localStorage.setItem('kanban_search', search); }, [search]);
    useEffect(() => { localStorage.setItem('kanban_stages', JSON.stringify(visibleStages)); }, [visibleStages]);

    async function load() {
        try {
            const res = await http.get('/manufacturing/batches');
            setBatches(res.data.batches);
        } catch (err) {
            console.error(err);
        }
    }

    useEffect(() => { load(); }, []);

    const filteredBatches = useMemo(() => {
        return batches.filter(b =>
            b.batchNumber.toLowerCase().includes(search.toLowerCase()) ||
            b.rawMaterial?.batchNo?.toLowerCase().includes(search.toLowerCase())
        );
    }, [batches, search]);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), // Drag after 5px move
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const batch = batches.find(b => b.id === active.id);
        setActiveDragBatch(batch || null);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveDragBatch(null);

        if (!over) return;

        const batchId = active.id as string;
        const newStage = over.id as string;
        const batch = batches.find(b => b.id === batchId);

        if (!batch || batch.currentStage === newStage) return;

        // Optimistic UI Update
        const oldStage = batch.currentStage;
        setBatches(prev => prev.map(b => b.id === batchId ? { ...b, currentStage: newStage } : b));

        try {
            await http.patch(`/manufacturing/batches/${batchId}/stage`, { stage: newStage });
            notify.showSuccess(`Batch ${batch.batchNumber} moved to ${newStage}`);
        } catch (err) {
            // Revert on error
            setBatches(prev => prev.map(b => b.id === batchId ? { ...b, currentStage: oldStage } : b));
            notify.showError('Failed to update stage');
        }
    };

    const toggleStage = (stage: string) => {
        setVisibleStages(prev =>
            prev.includes(stage) ? prev.filter(s => s !== stage) : [...prev, stage]
        );
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <Box sx={{
                p: '8px',
                height: 'calc(100vh - 120px)',
                display: 'flex',
                flexDirection: 'column',
                transform: 'scale(0.85)',
                transformOrigin: 'top left',
                width: '117.6%', // Compensate for 0.85 scale (100 / 0.85)
                overflow: 'hidden'
            }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>Production</Typography>

                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <TextField
                            size="small"
                            placeholder="Filter batches..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            InputProps={{
                                startAdornment: (<InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>),
                            }}
                            sx={{ bgcolor: 'background.paper', borderRadius: 1 }}
                        />
                        <Button
                            variant={compactMode ? "contained" : "outlined"}
                            size="small"
                            onClick={() => setCompactMode(!compactMode)}
                            sx={{ minWidth: 'auto', px: 1 }}
                        >
                            {compactMode ? "Compact" : "Standard"}
                        </Button>
                        <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
                            <SettingsIcon fontSize="small" />
                        </IconButton>
                        <Button
                            variant="contained"
                            size="small"
                            startIcon={<AddIcon />}
                            onClick={() => setOpenStart(true)}
                        >
                            New Batch
                        </Button>
                    </Box>
                </Box>

                <Popover
                    open={Boolean(anchorEl)}
                    anchorEl={anchorEl}
                    onClose={() => setAnchorEl(null)}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                >
                    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>Visible Stages</Typography>
                        {ALL_STAGES.map(stage => (
                            <FormControlLabel
                                key={stage}
                                control={<Checkbox checked={visibleStages.includes(stage)} onChange={() => toggleStage(stage)} size="small" />}
                                label={stage}
                            />
                        ))}
                    </Box>
                </Popover>

                <Box sx={{
                    display: 'flex',
                    gap: 1.5,
                    flexGrow: 1,
                    overflowX: 'auto',
                    pb: 1,
                    height: '100%',
                    flexWrap: 'wrap', // Allow wrapping
                    alignContent: 'flex-start' // Stack lines at start
                }}>
                    {ALL_STAGES.filter(s => visibleStages.includes(s)).map((stage) => (
                        <DroppableColumn
                            key={stage}
                            stage={stage}
                            batches={filteredBatches.filter(b => b.currentStage === stage)}
                            onEdit={setEditBatch}
                            compact={compactMode}
                        />
                    ))}
                </Box>

                <DragOverlay>
                    {activeDragBatch ? (
                        <Card sx={{ width: compactMode ? 240 : 300, opacity: 0.8, cursor: 'grabbing', transform: 'rotate(2deg)' }}>
                            <CardContent>
                                <Typography fontWeight="bold">{activeDragBatch.batchNumber}</Typography>
                            </CardContent>
                        </Card>
                    ) : null}
                </DragOverlay>

                <StartBatchDialog
                    open={openStart}
                    onClose={() => setOpenStart(false)}
                    onSave={() => { setOpenStart(false); load(); notify.showSuccess('Batch started successfully'); }}
                />

                <EditBatchDialog
                    open={!!editBatch}
                    batch={editBatch}
                    onClose={() => setEditBatch(null)}
                    onSave={() => { setEditBatch(null); load(); notify.showSuccess('Batch updated successfully'); }}
                />
            </Box>
        </DndContext>
    );
}
