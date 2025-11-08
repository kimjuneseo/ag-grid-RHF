export interface Answer<T = unknown> {
    /**
     * 응답 상태
     * */
    status: number;

    /**
     * 응답 데이터
     */
    result: T;

    /**
     * 응답 메시지
     */
    retMsg: string;

    /**
     * 코드
     */
    retCode: string;

    /**
     * Timezone
     */
    timeZone?: string;
}