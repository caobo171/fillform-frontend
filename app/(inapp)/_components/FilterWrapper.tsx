'use client'

import FilterLayout, { SectionOpt } from "@/components/layout/filter/filter-layout";
import { ORDERS, OtherSource, PodcastSource } from "@/core/Constants";
import { useCollections } from "@/hooks/collection";
import { useSources } from "@/hooks/source";
import { useMe } from "@/hooks/user";
import ACL from "@/services/ACL";
import React from "react";

export function FilterLayoutWrapper(props: { children: React.ReactNode }) {

    const { data, isLoading } = useCollections();
    const { data: sources, isLoading: sourceLoading } = useSources();

    const me = useMe();


    if (isLoading || sourceLoading || me.isLoading) return <></>;

    const filters = [

        me.data ? {
            id: 'scope',
            name: 'Podcasts',
            mode: 'radio',
            options: [
                { value: '', label: 'Bài nghe cho mọi người', default: true },
                { value: 'mine', label: 'Bài nghe bạn đăng' , premium: true},
                { value: 'listening', label: 'Bài đang nghe' },
                { value: 'listened', label: 'Bài đã nghe' },
            ]
        } : null,
        {
            id: 'collection_ids',
            name: 'Collections',
            options: (data?.collections || []).map(e => ({
                value: e.id,
                label: e.name
            }))
        },
        {
            id: 'length',
            name: 'Độ dài',
            mode: 'radio',
            options: [
                { value: '', label: 'Tất cả', default: true },
                { value: '*-50', label: 'Siêu ngắn' },
                { value: '51-200', label: 'Ngắn' },
                { value: '201-400', label: 'Vừa' },
                { value: '401-*', label: 'Dài' },
            ]
        },

        {
            id: 'order',
            name: 'Sắp xếp theo',
            mode: 'checkbox',
            options: ORDERS.map(e => ({ ...e, default: e.value == 'newest' }))
        },
        {
            id: 'source_keys',
            name: 'Nguồn nghe',
            options: [...(sources?.sources || []), OtherSource].map(e => ({
                value: e.id,
                label: e.name
            }))
        }
    ].filter(e => e) as SectionOpt[];

    return <FilterLayout filters={filters}>
        {props.children}
    </FilterLayout>;
}
