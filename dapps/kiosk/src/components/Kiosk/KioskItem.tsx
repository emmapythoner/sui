// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { OwnedObjectType } from '../Inventory/OwnedObjects';
import { DisplayObject } from '../DisplayObject';
import { Button } from '../Base/Button';
import { KioskListing } from '@mysten/kiosk';
import { KioskFnType } from '../../hooks/kiosk';
import {
	useCreateKioskMutation,
	useDelistMutation,
	usePurchaseItemMutation,
	useTakeMutation,
} from '../../mutations/kiosk';
import { toast } from 'react-hot-toast';
import { ObjectId } from '@mysten/sui.js';
import { useQueryClient } from '@tanstack/react-query';
import { TANSTACK_OWNED_KIOSK_KEY } from '../../utils/constants';

export type KioskItemProps = {
	isGuest?: boolean;
	listing?: KioskListing | null;
	kioskId: ObjectId;
	hasKiosk: boolean;
	onSuccess: () => void; // parent component onSuccess handler.
	listFn: KioskFnType;
	item: OwnedObjectType;
};

export function KioskItem({
	item,
	kioskId,
	listing = null,
	isGuest = false,
	hasKiosk = false,
	onSuccess,
	listFn,
}: KioskItemProps) {
	const queryClient = useQueryClient();
	const createKiosk = useCreateKioskMutation({
		onSuccess: () => {
			queryClient.invalidateQueries([TANSTACK_OWNED_KIOSK_KEY]);
			toast.success('Kiosk created successfully');
		},
	});

	const takeMutation = useTakeMutation({
		onSuccess: () => {
			toast.success('Item was transferred back to the address.');
			onSuccess();
		},
	});

	const delistMutation = useDelistMutation({
		onSuccess: () => {
			toast.success('Item delisted successfully');
			onSuccess();
		},
	});

	const purchaseMutation = usePurchaseItemMutation({
		onSuccess: () => {
			toast.success('Item purchased successfully');
			onSuccess();
		},
	});

	if (isGuest)
		return (
			<DisplayObject item={item} listing={listing}>
				<>
					{listing && hasKiosk && (
						<Button
							loading={purchaseMutation.isLoading}
							className="border-gray-400 bg-transparent hover:bg-primary hover:text-white md:col-span-2"
							onClick={() =>
								purchaseMutation.mutate({
									item: {
										...item,
										listing,
									},
									kioskId: kioskId,
								})
							}
						>
							Purchase
						</Button>
					)}
					{listing && !hasKiosk && (
						<div className="md:col-span-2 text-xs">
							<p>Create a kiosk to interact with other kiosks.</p>

							<Button
								className="mt-2"
								loading={createKiosk.isLoading}
								onClick={() => createKiosk.mutate()}
							>
								Click here to create.
							</Button>
						</div>
					)}
				</>
			</DisplayObject>
		);
	return (
		<DisplayObject item={item} listing={listing}>
			<>
				{!listing && !isGuest && (
					<>
						<Button
							className="border-transparent hover:bg-primary hover:text-white disabled:opacity-30 "
							loading={takeMutation.isLoading}
							disabled={item.isLocked}
							onClick={() =>
								takeMutation.mutate({
									item,
									kioskId: kioskId,
								})
							}
						>
							Take from Kiosk
						</Button>

						<Button
							className="border-gray-400 bg-transparent hover:bg-primary hover:text-white"
							onClick={() => listFn(item)}
						>
							List for Sale
						</Button>
					</>
				)}
				{listing && !isGuest && (
					<Button
						loading={delistMutation.isLoading}
						className="border-gray-400 bg-transparent hover:bg-primary hover:text-white md:col-span-2"
						onClick={() =>
							delistMutation.mutate({
								item: {
									...item,
									listing,
								},
								kioskId: kioskId,
							})
						}
					>
						Delist item
					</Button>
				)}
			</>
		</DisplayObject>
	);
}
