'use client'; 
import { useRef, useState } from 'react';
import { RHFTableColumnProps } from '@type/grid-form-table.type';
import RHFInput from '@components/RHFInput';
import RHFTable from '@components/grid-form/RHFTable';

interface UserData {
    userIndex?: string;
    
    name?: string;

    phone?: string;
}

export default function RHFTablePage() {
    const submitRef = useRef<HTMLButtonElement>();
    const [rowData, setRowData] = useState<UserData[]>([{
            userIndex: '1',
            name: '김준서',
            phone: '010-1111-2222'
        }, {
            userIndex: '2',
            name: '김철수',
            phone: '010-3333-5555'
        }, {
            userIndex: '3',
            name: '박철수',
            phone: '010-0000-0000'
        }, {
            userIndex: '4',
            name: '김영히',
            phone: '010-5512-9999'
        }
    ]);
    const columns: RHFTableColumnProps<UserData>[] = [
        { 
            headerName: 'Name', 
            field: 'name',
            render: ({ RHFProps }) => {
                return <RHFInput
                    rules={{
                        required: '이름은 필수입니다.'
                    }}
                    {...RHFProps}
                />;
            }
        },
        { 
            headerName: 'phone', 
            field: 'phone',
            render: ({ RHFProps }) => {
                return <RHFInput
                    rules={{
                        required: '전화번호는 필수입니다.'
                    }}
                    {...RHFProps}
                />;
            }
        }
    ];

    return (
        <div style={{
            padding: '40px',
            minHeight: '100vh',
            backgroundColor: '#f9fafb'
        }}>
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '32px',
                boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)'
            }}>
                <div style={{
                    marginBottom: '24px'
                }}>
                    <h1 style={{
                        fontSize: '24px',
                        fontWeight: '700',
                        color: '#111827',
                        marginBottom: '8px'
                    }}>
                        사용자 관리
                    </h1>
                    <p style={{
                        fontSize: '14px',
                        color: '#6b7280'
                    }}>
                        사용자 정보를 추가, 수정, 삭제할 수 있습니다.
                    </p>
                </div>

                <div style={{
                    width: '100%',
                    height: '400px',
                    marginBottom: '24px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    overflow: 'hidden'
                }}>
                    <RHFTable<UserData>
                        dataUniqueId='userIndex'
                        dataExisting={rowData}
                        dataDefault={{
                            name: '',
                            phone: ''
                        }}
                        columns={columns}
                        submitRef={submitRef}
                        customDeleteFunction={(rowid: string | string[]) => Promise.resolve(`${rowid}번째가 삭제되었습니다`)}
                        onSubmit={async (parms: UserData[]) => {
                            alert(JSON.stringify(parms))
                        }}
                    />
                </div>

                <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '12px'
                }}>
                    <button
                        onClick={() => submitRef.current?.click()}
                        style={{
                            padding: '10px 24px',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '600',
                            transition: 'all 0.2s',
                            boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#2563eb';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#3b82f6';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 1px 2px 0 rgb(0 0 0 / 0.05)';
                        }}
                    >
                        저장하기
                    </button>
                </div>
            </div>
        </div>
    );
}